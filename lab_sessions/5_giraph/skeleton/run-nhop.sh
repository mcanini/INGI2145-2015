#!/bin/bash

#./gradlew fatJar
#Mac only
#zip -d ./build/libs/Solution-all.jar META-INF/LICENSE
#zip -d ./build/libs/Solution-all.jar LICENSE

#For N hops neighbor computation
$HADOOP_HOME/bin/hadoop jar ./build/libs/Solution-all.jar be_uclouvain_ingi2145_lab05.NHopNeighbors -vif be_uclouvain_ingi2145_lab05.ComplexVertexInputFormat -vip /input/tiny_graph.txt -vof be_uclouvain_ingi2145_lab05.ComplexVertexOutputFormat -op /output/nhopneighbors -w 1 -ca ca=3 -ca giraph.SplitMasterWorker=false
