package be_uclouvain_ingi2145_lab05;

import org.apache.hadoop.io.Writable;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import java.util.HashSet;
import org.apache.hadoop.io.ArrayWritable;
import org.apache.hadoop.io.LongWritable;

public class VertexDataStructure implements Writable, Cloneable
{
    public LongWritable vertexValue = new LongWritable();
    public ArrayWritable received = new ArrayWritable(LongWritable.class);

    public VertexDataStructure() {}

    public VertexDataStructure(long value, HashSet<Long> received)
    {
        this.vertexValue.set(value);
        LongWritable[] ids= new LongWritable[received.size()];

        int i = 0;
        for (Long id : received) {
            ids[i] = new LongWritable(id);
            ++i;
        }
        this.received.set(ids);
    }
    
    @Override
    public String toString()
    {
        // We have to reimplement this because Hadoop is dumb.

        StringBuilder str = new StringBuilder();
        
        str.append(Long.toString(vertexValue.get()));
        str.append('\t');
        str.append(received);
        return str.toString();
    }

    @Override
    public void write(DataOutput out) throws IOException
    {
        this.vertexValue.write(out);
        this.received.write(out);
    }

    @Override
    public void readFields(DataInput in) throws IOException
    {
        this.vertexValue.readFields(in);
        this.received.readFields(in);
    }
}