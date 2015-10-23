package be_uclouvain_ingi2145_lab05;

import org.apache.hadoop.io.Writable;
import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;

public class Message implements Writable, Cloneable
{
    public LongWritable srcId = new LongWritable();
    public IntWritable hopCount = new IntWritable();
    public LongWritable senderId = new LongWritable();

    public Message() {}

    public Message(long id, int hopCount, long sender)
    {
        this.srcId.set(id);
        this.hopCount.set(hopCount);
        this.senderId.set(sender);
    }

    /*
    * String representation of the object
    */
    @Override
    public String toString()
    {
        StringBuilder str = new StringBuilder();
        
        str.append(Long.toString(srcId.get()));
        str.append('\t');
        str.append(Integer.toString(hopCount.get()));
        str.append('\t');
        str.append(Long.toString(senderId.get()));
        
        return str.toString();
    }

    /*
    * Serialization sequence
    */
    @Override
    public void write(DataOutput out) throws IOException
    {
        this.srcId.write(out);
        this.hopCount.write(out);
        this.senderId.write(out);
        
    }

    /*
    * Deserialization sequence
    */
    @Override
    public void readFields(DataInput in) throws IOException
    {
        this.srcId.readFields(in);
        this.hopCount.readFields(in);
        this.senderId.readFields(in);

    }
}