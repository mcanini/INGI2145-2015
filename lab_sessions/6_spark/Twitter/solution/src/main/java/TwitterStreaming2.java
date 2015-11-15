import org.apache.spark.api.java.*;
import org.apache.spark.api.java.function.*;
import org.apache.spark.streaming.*;
import org.apache.spark.streaming.api.java.*;
import org.apache.spark.streaming.twitter.*;
import twitter4j.*;
import java.util.Arrays;
import scala.Tuple2;
/*Print out the streams from the last minute*/
public class TwitterStreaming2 {
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
      statuses.print();
  ssc.checkpoint("checkpoints");
  ssc.start();
  }
}
