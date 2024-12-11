from flask import Flask, jsonify, request
from flask_cors import CORS
from pyspark.sql import SparkSession
from pyspark.sql.functions import year, count, avg, to_date, col
from pyspark.sql.types import DoubleType
from textblob import TextBlob

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Spark session
spark = SparkSession.builder.appName("YearVsListingsPriceLocation").getOrCreate()

# Load datasets
listings_path = "datasets/Listings_boston.csv"
reviews_path = "datasets/Reviews_boston.csv"

listings_df = spark.read.csv(listings_path, header=True, inferSchema=True)
reviews_df = spark.read.csv(reviews_path, header=True, inferSchema=True)

# Filter reviews for 2015 and later
reviews_df = reviews_df.withColumn("date", to_date(reviews_df.date, 'yyyy-MM-dd'))
reviews_df = reviews_df.filter(reviews_df.date >= "2015-01-01")

# Join Listings.csv with Reviews.csv on listing_id
joined_df = reviews_df.join(listings_df, on="listing_id")

# Select 10 distinct host locations
distinct_locations = (
    joined_df.select("host_location")
    .distinct()
    .limit(10)
    .rdd.flatMap(lambda x: x).collect()
)

# Filter data for these 10 locations
filtered_df = joined_df.filter(joined_df.host_location.isin(distinct_locations))

# Extract year from date
filtered_df = filtered_df.withColumn("year", year(filtered_df.date))

# Define a UDF for sentiment analysis using TextBlob
def get_sentiment(comment):
    analysis = TextBlob(comment)
    return analysis.sentiment.polarity

# Register the UDF with Spark
sentiment_udf = spark.udf.register("get_sentiment", get_sentiment, DoubleType())

# Apply sentiment analysis to reviews using the UDF
reviews_with_sentiment = reviews_df.withColumn("sentiment", sentiment_udf(col("comment")))

# Join the sentiment analysis back to the filtered dataframe by listing_id
sentiment_joined_df = filtered_df.join(reviews_with_sentiment, on="listing_id")

# Group by host_location and year and calculate average sentiment
sentiment_analysis_df = sentiment_joined_df.groupBy("year", "host_location").agg(
    avg("sentiment").alias("avg_sentiment")
)

# Collect sentiment analysis data
sentiment_analysis_data = sentiment_analysis_df.collect()

# Create the data dictionary to return
sentiment_analysis_dict = [
    {
        "year": row["year"],
        "host_location": row["host_location"],
        "avg_sentiment": row["avg_sentiment"]
    }
    for row in sentiment_analysis_data
]

# Grouping by location and year for number of listings and average price
location_yearly_data_df = (
    filtered_df.groupBy("year", "host_location")
    .agg(
        count("listing_id").alias("num_listings"),
        avg("price").alias("avg_price")
    )
    .orderBy("year", "host_location")
)

# Convert to Python dictionary for listings & price data
location_yearly_data = location_yearly_data_df.collect()
location_yearly_data_dict = [
    {
        "year": row["year"],
        "host_location": row["host_location"],
        "num_listings": row["num_listings"],
        "avg_price": row["avg_price"]
    }
    for row in location_yearly_data
]

# Grouping by location and year for the number of reviews
location_yearly_reviews_df = (
    filtered_df.groupBy("year", "host_location")
    .agg(count("reviewer_id").alias("num_reviews"))
    .orderBy("year", "host_location")
)

# Convert reviews data to Python dictionary
location_yearly_reviews = location_yearly_reviews_df.collect()
location_yearly_reviews_dict = [
    {
        "year": row["year"],
        "host_location": row["host_location"],
        "num_reviews": row["num_reviews"]
    }
    for row in location_yearly_reviews
]

@app.route('/api/year-room-type', methods=['GET'])
def get_year_room_type():
    # Ensure room_type is available in filtered_df (it should be in listings_df)
    year_room_type_df = (
        filtered_df.groupBy("year", "room_type")
        .agg(count("listing_id").alias("num_listings"))
        .orderBy("year", "room_type")
    )

    # Convert the results to a dictionary for JSON response
    year_room_type_data = year_room_type_df.collect()
    year_room_type_dict = [
        {
            "year": row["year"],
            "room_type": row["room_type"],
            "num_listings": row["num_listings"]
        }
        for row in year_room_type_data
    ]
    return jsonify(year_room_type_dict)


@app.route('/api/average-price', methods=['GET'])
def get_average_price():
    # Get the room type and location from the query parameters
    room_type = request.args.get('room_type')
    location = request.args.get('location')

    # Filter the data based on room type and location, then calculate average price
    filtered_df = listings_df.filter((col("room_type") == room_type) & (col("host_location") == location))
    avg_price = filtered_df.agg(avg("price").alias("average_price")).collect()

    # Get the average price from the result
    if avg_price:
        return jsonify({"average_price": avg_price[0]["average_price"]})
    else:
        return jsonify({"error": "No data found for the given room type and location."})

@app.route('/api/locations', methods=['GET'])
def get_locations():
    locations = listings_df.select("host_location").distinct().rdd.flatMap(lambda x: x).collect()
    return jsonify(locations)

@app.route('/api/room-types', methods=['GET'])
def get_room_types():
    room_types = listings_df.select("room_type").distinct().rdd.flatMap(lambda x: x).collect()
    return jsonify(room_types)


@app.route('/api/location-yearly-listings-price', methods=['GET'])
def get_location_yearly_listings_price():
    return jsonify(location_yearly_data_dict)

@app.route('/api/location-yearly-reviews', methods=['GET'])
def get_location_yearly_reviews():
    return jsonify(location_yearly_reviews_dict)

@app.route('/api/location-yearly-sentiment', methods=['GET'])
def get_location_yearly_sentiment():
    return jsonify(sentiment_analysis_dict)

if __name__ == "__main__":
    app.run(debug=True)
