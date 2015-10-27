/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package be_uclouvain_ingi2145_lab05;

import java.io.IOException;
import org.apache.giraph.edge.Edge;
import org.apache.giraph.graph.Vertex;
import org.apache.giraph.io.formats.TextVertexOutputFormat;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.json.JSONArray;
import org.json.JSONException;

/**
 *
 * @author mb
 */
public class SimpleVertexOutputFormat extends
        TextVertexOutputFormat<LongWritable, DoubleWritable,
        FloatWritable> {
 
    @Override
    public TextVertexWriter createVertexWriter(TaskAttemptContext context)
            throws IOException, InterruptedException {
        /*RecordWriter<Text, Text> recordWriter =
            textOutputFormat.getRecordWriter(context);
                */
        return new SimpleShortestPathsVertexWriter();
        //return new SimpleShortestPathsVertexWriter(recordWriter);
            }

 
public class SimpleShortestPathsVertexWriter extends
        TextVertexWriter {

        @Override
        public void writeVertex(Vertex<LongWritable, DoubleWritable, FloatWritable> vertex) throws IOException, InterruptedException {
        JSONArray jsonVertex = new JSONArray();
        try {
            jsonVertex.put(vertex.getId().get());
            jsonVertex.put(vertex.getValue().get());
            JSONArray jsonEdgeArray = new JSONArray();
            for (Edge<LongWritable, FloatWritable> edge :
                    vertex.getEdges()) {
                JSONArray jsonEdge = new JSONArray();
                jsonEdge.put(edge.getTargetVertexId().get());
                jsonEdge.put(edge.getValue().get());
                jsonEdgeArray.put(jsonEdge);
            }
            jsonVertex.put(jsonEdgeArray);
        } catch (JSONException e) {
            throw new IllegalArgumentException(
                "writeVertex: Couldn't write vertex " + vertex);
        }   
        getRecordWriter().write(new Text(jsonVertex.toString()), null);
        }

    }
}