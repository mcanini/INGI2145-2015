This project uses maven as the build system. 
Maven is already installed on the VM and you don't need to install it. 
The code skeletons will not build correctly as you need to plug in the holes in the code to make it compilable. 

- To build the application use
	mvn package

Once the build process is done. There will be a jar located in the ./target/ folder


For KMeans:
The Jar is named kmeans-1.0.jar

You can run this jar using a command like:
/usr/local/spark/bin/spark-submit --class WikipediaKMeans --master local[4] target/kmeans-1.0.jar


For Twitter Streaming:
The Jar is named streaming-1.0.jar

You can run this jar using a command like:
/usr/local/spark/bin/spark-submit --class TwitterStreaming --master local[4] target/streaming-1.0.jar