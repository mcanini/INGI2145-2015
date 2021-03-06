#!/bin/bash

if [ -z "$HADOOP_HOME" ]; then
    echo "HADOOP_HOME is not set. Cannot continue."
    exit 1
fi

sudo hostname ingi2145-vm

$HADOOP_HOME/sbin/stop-dfs.sh
$HADOOP_HOME/sbin/stop-yarn.sh

rm -rf $HADOOP_HOME/data/*
$HADOOP_HOME/bin/hadoop namenode -format

$HADOOP_HOME/sbin/start-dfs.sh
$HADOOP_HOME/sbin/start-yarn.sh

$HADOOP_HOME/bin/hdfs dfs -mkdir /input
$HADOOP_HOME/bin/hdfs dfs -copyFromLocal /labs/5_giraph/skeleton/input/tiny_graph.txt /input/tiny_graph.txt
