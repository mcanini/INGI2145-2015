package be_uclouvain_ingi2145_lab05;

import org.apache.giraph.graph.BasicComputation;
import org.apache.giraph.edge.Edge;
import org.apache.giraph.graph.Vertex;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.log4j.Logger;

import java.io.IOException;
import org.apache.giraph.Algorithm;
import org.apache.hadoop.conf.Configuration;
import org.apache.log4j.Level;

/**
 * Demonstrates the basic Pregel Single source shortest paths implementation.
 */
@Algorithm(
    name = "Shortest paths",
    description = "Finds all shortest paths from a selected vertex"
)
public class SingleSourceShortestPath extends BasicComputation<
    LongWritable, DoubleWritable, FloatWritable, DoubleWritable>{

  private Configuration conf = new Configuration();
  public final Long SOURCE_ID = Long.parseLong(conf.get("ca", "1"));
  /** Class logger */
  private static final Logger LOG =
      Logger.getLogger(SingleSourceShortestPath.class);

  /**
   * Is this vertex the source id?
   *
   * @param vertex Vertex
   * @return True if the source id
   */
  private boolean isSource(Vertex<LongWritable, ?, ?> vertex) {
      LOG.fatal("The source object is " +SOURCE_ID);
    return vertex.getId().get() == SOURCE_ID;
  }

  @Override
  public void compute(
      Vertex<LongWritable, DoubleWritable, FloatWritable> vertex,
      Iterable<DoubleWritable> messages) throws IOException {
    
    // Write your compute logic here!

    vertex.voteToHalt();
  }
}
