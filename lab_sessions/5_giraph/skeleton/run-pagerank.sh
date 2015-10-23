#!/bin/bash

#./gradlew fatJar
#Mac only
#zip -d ./build/libs/Solution-all.jar META-INF/LICENSE
#zip -d ./build/libs/Solution-all.jar LICENSE

##For Page Rank Algorithm
$HADOOP_HOME/bin/hadoop jar ./build/libs/Solution-all.jar be_uclouvain_ingi2145_lab05.PageRank -vif be_uclouvain_ingi2145_lab05.SimpleVertexInputFormat -vip /input/tiny_graph.txt -vof be_uclouvain_ingi2145_lab05.SimpleVertexOutputFormat -op /output/pagerank -w 1 -ca giraph.SplitMasterWorker=false
