package be_uclouvain_ingi2145_lab04;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.WritableComparable;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.log4j.Appender;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.FileAppender;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.log4j.SimpleLayout;
import org.apache.log4j.varia.LevelRangeFilter;

import java.io.IOException;
import java.net.URI;

public class WordCount extends Configured implements Tool
{
    public static void main(String[] args) throws Exception
    {
        // configure log4j to output to a file
        Logger logger = LogManager.getRootLogger();
        logger.addAppender(new FileAppender(new SimpleLayout(), "lab03.log"));

        // configure log4j to output to the console
        Appender consoleAppender = new ConsoleAppender(new SimpleLayout());
        LevelRangeFilter filter = new LevelRangeFilter();
        // switch to another level for more detail (own (INGI2145) messages use FATAL)
        filter.setLevelMin(Level.ERROR);
        consoleAppender.addFilter(filter);
        // (un)comment to (un)mute console output
        logger.addAppender(consoleAppender);

        // switch to Level.DEBUG or Level.TRACE for more detail
        logger.setLevel(Level.INFO);

        WordCount self = new WordCount();
        Configuration conf = new Configuration();

        int res = ToolRunner.run(conf, self, args);
        System.exit(res);
    }

    // ---------------------------------------------------------------------------------------------

    @Override
    public int run(String[] args) throws Exception
    {
        String inputDir  = "input";
        String outputDir = "output";

        deleteDir(outputDir);

        Job job = Job.getInstance(getConf());
        job.setJarByClass(WordCount.class);


        // TODO: implement the driver (configure the job)

        return job.waitForCompletion(true) ? 0 : 1;
    }

    // ---------------------------------------------------------------------------------------------

    // TODO: fill in the right types
    public static class Map extends Mapper<KEY1, VALUE1, KEY2, VALUE2>
    {
        @Override
        protected void map(KEY1 key, VALUE1 value, Context context)
            throws IOException, InterruptedException
        {
            // TODO: implement the mapper
        }
    }

    // ---------------------------------------------------------------------------------------------

    // TODO: fill in the right types
    public static class Reduce extends Reducer<KEY2, VALUE2, KEY3, VALUE3>
    {
        @Override
        protected void reduce(KEY2 key, Iterable<VALUE2> values, Context context)
            throws IOException, InterruptedException
        {
            // TODO: implement the reducer
        }
    }

    // ---------------------------------------------------------------------------------------------

    /**
     * Delete the given folder.
     */
    public void deleteDir(String path)
    {
        try {
            FileSystem fs = FileSystem.get(URI.create(path), getConf());
            Path p = new Path(path);

            if (fs.exists(p)) {
                fs.delete(p, true);
            }

            fs.close();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }
}
