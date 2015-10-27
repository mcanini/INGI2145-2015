#!/bin/bash

sudo hostname ingi2145-vm 

$HADOOP_HOME/sbin/stop-dfs.sh
$HADOOP_HOME/sbin/stop-yarn.sh

rm -rf $HADOOP_HOME/data/*
$HADOOP_HOME/bin/hadoop namenode -format

$HADOOP_HOME/sbin/start-dfs.sh
$HADOOP_HOME/sbin/start-yarn.sh

$HADOOP_HOME/bin/hdfs dfs -mkdir /input
$HADOOP_HOME/bin/hdfs dfs -copyFromLocal /vagrant/labs/5_giraph/Skeleton/input/tiny_graph.txt /input/tiny_graph.txt