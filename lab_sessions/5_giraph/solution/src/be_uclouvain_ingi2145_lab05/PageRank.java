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
    name = "Page rank"
)
public class PageRank extends BasicComputation<LongWritable,
    DoubleWritable, FloatWritable, DoubleWritable> {
  /** Number of supersteps for this test */
  public static final int MAX_SUPERSTEPS = 30;
  /** Logger */
  private static final Logger LOG =
      Logger.getLogger(PageRank.class);

  @Override
  public void compute(
      Vertex<LongWritable, DoubleWritable, FloatWritable> vertex,
      Iterable<DoubleWritable> messages) throws IOException {
      
      if (getSuperstep() >= 1) {
      double sum = 0;
      for (DoubleWritable message : messages) {
        sum += message.get();
      }
      DoubleWritable vertexValue =
          new DoubleWritable((0.15f / getTotalNumVertices()) + 0.85f * sum);
      vertex.setValue(vertexValue);
      /*aggregate(MAX_AGG, vertexValue);
      aggregate(MIN_AGG, vertexValue);
      aggregate(SUM_AGG, new LongWritable(1));
      LOG.info(vertex.getId() + ": PageRank=" + vertexValue +
          " max=" + getAggregatedValue(MAX_AGG) +
          " min=" + getAggregatedValue(MIN_AGG));
      */
    }

    if (getSuperstep() < MAX_SUPERSTEPS) {
      long edges = vertex.getNumEdges();
      sendMessageToAllEdges(vertex,
          new DoubleWritable(vertex.getValue().get() / edges));
    } else {
      vertex.voteToHalt();
    }
    }
}

