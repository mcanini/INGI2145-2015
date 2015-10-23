package be_uclouvain_ingi2145_lab05;

import org.apache.giraph.graph.BasicComputation;
import org.apache.giraph.edge.Edge;
import org.apache.giraph.graph.Vertex;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.util.HashSet;
import org.apache.giraph.Algorithm;
import org.apache.hadoop.io.ArrayWritable;
import org.apache.hadoop.io.Writable;
import org.apache.hadoop.conf.Configuration;
import org.apache.log4j.Level;

/**
 * Demonstrates the basic Pregel N hop neighbor implementation.
 * @author MB
 */
@Algorithm(
    name = "N Hop Neighbors",
    description = "Finds the number of neighbors that are within N Hops"
)
public class NHopNeighbors extends BasicComputation<
    LongWritable, VertexDataStructure, FloatWritable, Message>{
    
  private static final Logger LOG =
      Logger.getLogger(NHopNeighbors.class);

  private Configuration conf = new Configuration();
  public final Long nhops = Long.parseLong(conf.get("ca", "3"));

  @Override
  public void compute(
      Vertex<LongWritable, VertexDataStructure, FloatWritable> vertex,
      Iterable<Message> messages) throws IOException {
      
      LOG.setLevel(Level.DEBUG);
      // Initialization Super Step 0
      if (getSuperstep() == 0) {
      vertex.setValue(new VertexDataStructure(0l,new HashSet<Long>()));
      for (Edge<LongWritable, FloatWritable> edge : vertex.getEdges()) {
        Message m = new Message(vertex.getId().get(),nhops.intValue(),0l);
        sendMessage(edge.getTargetVertexId(), m);
        LOG.debug("Sending message "+ m + " to " + edge.getTargetVertexId());
      }
      }
      //Create local variables
      HashSet<Long> received = new HashSet<>();
      ArrayWritable vertexValue = vertex.getValue().received;
      
      for(Writable value : vertexValue.get()){
          LongWritable v = (LongWritable) value;
          received.add(v.get());
      }
      Long nodeCount = vertex.getValue().vertexValue.get();
      // Process all messages
      for (Message message : messages) {
        //If message is a reply from another node
        if(message.srcId.equals(vertex.getId())){
            LOG.debug("Reply received" + message);
            if(!received.contains(message.senderId.get())){
                received.add(message.senderId.get());
                LOG.debug(received + " " +vertex.getId() );
                nodeCount++;
            }
            
        }//If it is a new message from another node
        else if(message.hopCount.get()>0){
            sendMessage(message.srcId,new Message(message.srcId.get(),
                    message.hopCount.get()-1,vertex.getId().get()));
             for (Edge<LongWritable, FloatWritable> edge : vertex.getEdges()) {
                   sendMessage(edge.getTargetVertexId(), new Message(message.srcId.get(),
                    message.hopCount.get()-1,vertex.getId().get()));
            }
        }
    }
    
    //Push the updates
    VertexDataStructure vDS = new VertexDataStructure(nodeCount,
                                received);
    vertex.setValue(vDS);
    
    //Vote to halt
    vertex.voteToHalt();
  }
}
