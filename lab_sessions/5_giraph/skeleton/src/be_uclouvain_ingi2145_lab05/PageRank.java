package be_uclouvain_ingi2145_lab05;

import java.io.IOException;
import org.apache.giraph.Algorithm;
import org.apache.giraph.aggregators.DoubleMaxAggregator;
import org.apache.giraph.aggregators.DoubleMinAggregator;
import org.apache.giraph.aggregators.LongSumAggregator;
import org.apache.giraph.graph.BasicComputation;
import org.apache.giraph.graph.Vertex;
import org.apache.giraph.master.DefaultMasterCompute;
import org.apache.giraph.worker.WorkerContext;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.log4j.Logger;

/**
 *
 * @author mb
 */
@Algorithm(
    name = "Page rank",
    description = "Finds the Page rank of the vertex"
)
public class PageRank extends BasicComputation<LongWritable,
    DoubleWritable, FloatWritable, DoubleWritable> {
  /** Number of supersteps for this test */
  public static final int MAX_SUPERSTEPS = 30;

  private static final Logger LOG =
      Logger.getLogger(PageRank.class);
  
  @Override
  public void compute(
      Vertex<LongWritable, DoubleWritable, FloatWritable> vertex,
      Iterable<DoubleWritable> messages) throws IOException {
    
    //Write code here
    if (getSuperstep() < MAX_SUPERSTEPS) {
      //Write code here
    } else {
      vertex.voteToHalt();
    }
  }

}
