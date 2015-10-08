package be_uclouvain_ingi2145_p1;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
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

public class PoIDriver extends Configured implements Tool
{
    /**
     * Singleton instance.
     */
    public static PoIDriver GET;

    /**
     * Author's name.
     */
    public static final String NAME = "HEY YOU, WRITE YOUR NAME HERE";

    // ---------------------------------------------------------------------------------------------

    public static void main(String[] args) throws Exception
    {
        // configure log4j to output to a file
        Logger logger = LogManager.getRootLogger();
        logger.addAppender(new FileAppender(new SimpleLayout(), "p1.log"));

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

        GET = new PoIDriver();
        Configuration conf = new Configuration();

        int res = ToolRunner.run(conf, GET, args);
        System.exit(res);
    }

    // ---------------------------------------------------------------------------------------------

    // Depending on your implementation the number of stages might differ
    // Consider this skeleton as a outline you should be able to change it according to your needs. 
    @Override
    public int run(String[] args) throws Exception
    {
        System.out.println(NAME);

        if (args.length == 0) {
            args = new String[]{ "command missing" };
        }

        switch (args[0]) {
            case "init":
                init(args[1], args[2], args[3], args[4], Integer.parseInt(args[5]));
                break;
            case "iter":
                iter(args[1], args[2], args[3], args[4], Integer.parseInt(args[5]), Integer.parseInt(args[6]));
                break;
            case "evaluate":
                evaluate(args[1], args[2], args[3], args[4], Integer.parseInt(args[5]));
                break;
            case "composite":
                composite(args[1], args[2], args[3], args[4], Integer.parseInt(args[5]), Integer.parseInt(args[6]));
                break;
            default:
                System.out.println("Unknown command: " + args[0]);
                break;
        }

        return 0;
    }

    // ---------------------------------------------------------------------------------------------

    void init(String inputDir, String outputDir, String srcId, String dstId, int nReducers) throws Exception
    {
        Logger.getRootLogger().fatal("[INGI2145] init");

        // TODO
    }

    // ---------------------------------------------------------------------------------------------
    //iterNo is the value of iteration counter

    void iter(String inputDir, String outputDir, String srcId, String dstId, int iterNo, int nReducers) throws Exception
    {
        Logger.getRootLogger().fatal("[INGI2145] iter: " + inputDir + " (to) " + outputDir);

        // TODO
    }


    // ---------------------------------------------------------------------------------------------

    void evaluate(String inputDir, String outputDir, String srcId, String dstId, int nReducers) throws Exception
    {
        Logger.getRootLogger().fatal("[INGI2145] evaluate from:" + inputDir);

        // TODO
    }

    // ---------------------------------------------------------------------------------------------
    // maxHops is the maximum number of hops in which the destination should be reached
    void composite(String inputDir, String outputDir, String srcId, String dstId, int maxHops, int nReducers) throws Exception
    {
        Logger.getRootLogger().fatal("[INGI2145] composite: " + inputDir + " (to) " + outputDir);

    }
}