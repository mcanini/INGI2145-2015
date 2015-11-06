import org.apache.spark.streaming.api.java.*;
import org.apache.spark.storage.StorageLevel;
//import scala.io.Source;
import java.io.*;
import java.util.List;
import java.util.HashMap;
import java.util.ArrayList;
import org.apache.log4j.Logger;
import org.apache.log4j.Level;
import java.lang.*;

class StreamingHelper {
  static {
    Logger.getLogger("org.apache.spark").setLevel(Level.WARN);
    Logger.getLogger("org.apache.spark.streaming.NetworkInputTracker").setLevel(Level.INFO);
  }

  static void configureTwitterCredentials() throws Exception {
    String confDir = System.getProperty("user.dir")+"/src/main/resources/twitter.txt";
    File file = new File(confDir);
    if (!file.exists()) {
      throw new Exception(confDir);
    }
    List<String> lines = readLines(file);
    HashMap<String, String> map = new HashMap<String, String>();
    for (int i = 0; i < lines.size(); i++) {
      String line  = lines.get(i);
      String[] splits = line.split("=");
      if (splits.length != 2) {
        throw new Exception("Error parsing configuration file - incorrectly formatted line [" + line + "]");
      }
      map.put(splits[0].trim(), splits[1].trim());
    }
    String[] configKeys = { "consumerKey", "consumerSecret", "accessToken", "accessTokenSecret" };
    for (int k = 0; k < configKeys.length; k++) {
      String key = configKeys[k];
      String value = map.get(key);
      if (value == null) {
        throw new Exception("Error setting OAuth authentication - value for " + key + " not found");
      } else if (value.length() == 0) {
        throw new Exception("Error setting OAuth authentication - value for " + key + " is empty");
      }
      String fullKey = "twitter4j.oauth." + key;
      System.setProperty(fullKey, value);
      System.out.println("\tProperty " + fullKey + " set as " + value);
    }
    System.out.println();
  }

  private static List<String> readLines(File file) throws IOException {
    FileReader fileReader = new FileReader(file);
    BufferedReader bufferedReader = new BufferedReader(fileReader);
    List<String> lines = new ArrayList<String>();
    String line = null;
    while ((line = bufferedReader.readLine()) != null) {
      if (line.length() > 0) lines.add(line);
    }
    bufferedReader.close();
    return lines;
  }
}

