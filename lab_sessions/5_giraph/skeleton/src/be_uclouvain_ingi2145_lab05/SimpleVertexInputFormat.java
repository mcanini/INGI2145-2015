package be_uclouvain_ingi2145_lab05;

import java.io.IOException;
import org.apache.giraph.edge.Edge;
import org.apache.giraph.edge.EdgeFactory;
import org.apache.giraph.graph.Vertex;
import org.apache.giraph.io.formats.TextVertexInputFormat;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.InputSplit;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.json.JSONArray;
import org.json.JSONException;

/**
 *
 * @author mb
 */
public class SimpleVertexInputFormat extends
        TextVertexInputFormat<LongWritable, DoubleWritable, FloatWritable> {

    @Override
    public TextVertexReader createVertexReader(InputSplit is, TaskAttemptContext tac) throws IOException {
        return new SimpleShortestPathsVertexReader();
    }

 
public class SimpleShortestPathsVertexReader extends
        TextVertexReader{

    @Override
    public boolean nextVertex() throws IOException, InterruptedException {
        if (!getRecordReader().nextKeyValue()) {
            return false;
        }
    return true;
    }

    @Override
    public Vertex<LongWritable, DoubleWritable, FloatWritable> getCurrentVertex() throws IOException, InterruptedException {
        Text line = getRecordReader().getCurrentValue();
        Vertex<LongWritable, DoubleWritable, FloatWritable> vertex = getConf().createVertex();
        try {
        JSONArray jsonVertex = new JSONArray(line.toString());
        vertex.initialize(new LongWritable(jsonVertex.getLong(0)),new DoubleWritable(jsonVertex.getDouble(1)));
        JSONArray jsonEdgeArray = jsonVertex.getJSONArray(2);
        for (int i = 0; i < jsonEdgeArray.length(); ++i) {
            JSONArray jsonEdge = jsonEdgeArray.getJSONArray(i);
            Edge<LongWritable, FloatWritable> edge = EdgeFactory.create(new LongWritable(jsonEdge.getLong(0)),
                    new FloatWritable((float) jsonEdge.getDouble(1)));
            vertex.addEdge(edge);
            }
        } catch (JSONException e) {
        throw new IllegalArgumentException(
            "next: Couldn't get vertex from line " + line, e);
        }    
        return vertex;
        }
    }
}
