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
    String sparkHome = "/usr/local/spark";
    // URL of the Spark cluster
    String sparkUrl = "local[4]";
    // Location of the required JAR files
    String jarFile = "target/streaming-1.0.jar";
    // Twitter credentials from login.txt
    StreamingHelper.configureTwitterCredentials();
    // Generate spark's streaming context
   JavaStreamingContext ssc = new JavaStreamingContext(
      sparkUrl, "Streaming", new Duration(1000), sparkHome, new String[]{jarFile});
    // Get a stream of tweets
   JavaDStream<Status> tweets = TwitterUtils.createStream(ssc);
   JavaDStream<String> statuses = tweets.map(
      new Function<Status, String>() {
        public String call(Status status) { return status.getText(); }
      }
    );

   // TODO 1- Split tweets into words for further processing
   //JavaDStream<String> words;
   
   // TODO 2- Separate the hashtags
   //JavaDStream<String> hashTags;

   // TODO 3- Map hashtags to integers of 1
   //JavaPairDStream<String, Integer> tuples;

   // Reduce hashtag maps by aggregating their counts in a sliding window fashion
   // reduceByKeyAndWindow(Func1, Func2) counts hashtags in a 5-minute window that shifts every second
   // ->Func1 aggregates counts of newer hashtags
   // ->Func2 decrements counts of older hashtags
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

   //Swap the keys and values (in order to sort hashtags by their counts)
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
