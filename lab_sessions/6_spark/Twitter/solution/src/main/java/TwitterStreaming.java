import org.apache.spark.api.java.*;
import org.apache.spark.api.java.function.*;
import org.apache.spark.streaming.*;
import org.apache.spark.streaming.api.java.*;
import org.apache.spark.streaming.twitter.*;
import twitter4j.*;
import java.util.Arrays;
import scala.Tuple2;
public class TwitterStreaming {
  public static void main(String[] args) throws Exception {
    // Location of the Spark directory
    String sparkHome = "usr/local/spark";
    // URL of the Spark cluster
    String sparkUrl = "local[4]";
    // Location of the required JAR files
    String jarFile = "target/streaming-1.0.jar";
    // Twitter credentials from login.txt
    StreamingHelper.configureTwitterCredentials();
    // Generating spark's streaming context
   JavaStreamingContext ssc = new JavaStreamingContext(
      sparkUrl, "Streaming", new Duration(1000), sparkHome, new String[]{jarFile});
    // Obtain a set of tweets
   JavaDStream<Status> tweets = TwitterUtils.createStream(ssc);
   JavaDStream<String> statuses = tweets.map(
      new Function<Status, String>() {
        public String call(Status status) { return status.getText(); }
      }
    );

   // implement these steps (m)
   // Split these tweets into words for further processing
   JavaDStream<String> words = statuses.flatMap(
     new FlatMapFunction<String, String>() {
       public Iterable<String> call(String in) {
         return Arrays.asList(in.split(" "));
       }
     }
   );

   // Separate the hashtags
   JavaDStream<String> hashTags = words.filter(
     new Function<String, Boolean>() {
       public Boolean call(String word) { return word.startsWith("#"); }
     }
   );

   // Map hashtags to their respective counts
   JavaPairDStream<String, Integer> tuples = hashTags.mapToPair(
      new PairFunction<String, String, Integer>() {
        public Tuple2<String, Integer> call(String in) {
          return new Tuple2<String, Integer>(in, 1);
        }
      }
    );
   // provided to them (m)
   // ask: what would happen if we don't pass 2 functions that are the inverse of each other? (m)
   // Reduce hashtag maps to aggregate their counts in a sliding window fashion
   // reduceByKeyAndWindow counts hashtags in a 5-minute window that shifts every second
   JavaPairDStream<String, Integer> counts = tuples.reduceByKeyAndWindow(
      new Function2<Integer, Integer, Integer>() {
        public Integer call(Integer i1, Integer i2) { return i1 + i2; }
      },
      new Function2<Integer, Integer, Integer>() {
        public Integer call(Integer i1, Integer i2) { return i1 - i2; }
      },
      new Duration(60 * 5 * 1000),
      new Duration(1 * 1000)
    );

   //Swap the key-value pairs for the counts (in order to sort hashtags by their counts)
   JavaPairDStream<Integer, String> swappedCounts = counts.mapToPair(
     new PairFunction<Tuple2<String, Integer>, Integer, String>() {
       public Tuple2<Integer, String> call(Tuple2<String, Integer> in) {
         return in.swap();
       }
     }
   );

   //Sort swapped map from highest to lowest
   JavaPairDStream<Integer, String> sortedCounts = swappedCounts.transformToPair(
     new Function<JavaPairRDD<Integer, String>, JavaPairRDD<Integer, String>>() {
       public JavaPairRDD<Integer, String> call(JavaPairRDD<Integer, String> in) throws Exception {
         return in.sortByKey(false);
       }
     });

   //Print top 10 hashtags
   sortedCounts.foreach(
     new Function<JavaPairRDD<Integer, String>, Void> () {
       public Void call(JavaPairRDD<Integer, String> rdd) {
         String out = "\nTop 10 hashtags:\n";
         for (Tuple2<Integer, String> t: rdd.take(10)) {
           out = out + t.toString() + "\n";
         }
         System.out.println(out);
         return null;
       }
     }
   );
  ssc.checkpoint("checkpoints");
  ssc.start();
  }
}
