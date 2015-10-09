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

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import java.net.URI;
import java.util.StringTokenizer;

public class WordCount extends Configured implements Tool
{
    public static void main(String[] args) throws Exception
    {
        // configure log4j to output to a file
        Logger logger = LogManager.getRootLogger();
        logger.addAppender(new FileAppender(new SimpleLayout(), "lab04.log"));

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
        String inputDir  = args[0];
        String intermDir = args[1];
        String outputDir = args[2];

        deleteDir(intermDir);
        deleteDir(outputDir);

        Job count = Job.getInstance(getConf());
        count.setJarByClass(WordCount.class);

        count.setOutputKeyClass(Text.class);
        count.setOutputValueClass(IntWritable.class);

        count.setMapperClass(CountMap.class);
        count.setReducerClass(CountReduce.class);

        FileInputFormat.addInputPath(count, new Path(inputDir));
        FileOutputFormat.setOutputPath(count, new Path(intermDir));

        if (!count.waitForCompletion(true)) {
            return 1;
        }

        Job sort = Job.getInstance(getConf());
        sort.setJarByClass(WordCount.class);

        sort.setOutputKeyClass(WordWithCount.class);
        sort.setOutputValueClass(NullWritable.class);

        sort.setMapperClass(SortMap.class);
        sort.setReducerClass(SortReduce.class);

        FileInputFormat.addInputPath(sort, new Path(intermDir));
        FileOutputFormat.setOutputPath(sort, new Path(outputDir));

        return sort.waitForCompletion(true) ? 0 : 1;
    }

    // ---------------------------------------------------------------------------------------------

    public static class CountMap extends Mapper<LongWritable, Text, Text, IntWritable>
    {
        private final static IntWritable ONE = new IntWritable(1);
        private Text word = new Text();

        @Override
        protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException
        {
            Text word = new Text();
            String line = value.toString();
            StringTokenizer tokenizer = new StringTokenizer(line);

            while (tokenizer.hasMoreTokens()) {
                word.set(tokenizer.nextToken());
                context.write(word, ONE);
            }
        }
    }

    // ---------------------------------------------------------------------------------------------


    public static class CountReduce extends Reducer<Text, IntWritable, Text, IntWritable>
    {
        @Override
        protected void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException
        {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            context.write(key, new IntWritable(sum));
        }
    }

    // ---------------------------------------------------------------------------------------------

    static class WordWithCount implements WritableComparable<WordWithCount>
    {
        Text word = new Text();
        IntWritable count = new IntWritable();

        @Override
        public void write(DataOutput out) throws IOException
        {
            word.write(out);
            count.write(out);
        }

        @Override
        public void readFields(DataInput in) throws IOException
        {
            word.readFields(in);
            count.readFields(in);
        }

        @Override
        public int compareTo(WordWithCount o)
        {
            int comp = -count.compareTo(o.count);
            return comp == 0 ? 1 : comp;
        }

        @Override
        public String toString()
        {
            return String.format("%s %d", word.toString(), count.get());
        }
    }

    // ---------------------------------------------------------------------------------------------

    public static class SortMap extends Mapper<LongWritable, Text, WordWithCount, NullWritable>
    {
        @Override
        protected void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException
        {
            String[] fields = value.toString().split("\\s+");
            WordWithCount wwc = new WordWithCount();
            wwc.word  = new Text(fields[0]);
            wwc.count = new IntWritable(Integer.parseInt(fields[1]));
            context.write(wwc, NullWritable.get());
        }
    }

    // ---------------------------------------------------------------------------------------------

    public static class SortReduce extends Reducer<WordWithCount, NullWritable, WordWithCount, NullWritable>
    {
        @Override
        protected void reduce(WordWithCount key, Iterable<NullWritable> values, Context context)
            throws IOException, InterruptedException
        {
            context.write(key, NullWritable.get());
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
