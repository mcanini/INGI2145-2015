/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package be_uclouvain_ingi2145_lab05;

import java.net.URI;
import java.util.Arrays;
import org.apache.commons.cli.CommandLine;
import org.apache.giraph.conf.GiraphConfiguration;
import org.apache.giraph.job.GiraphJob;
import org.apache.giraph.utils.ConfigurationUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;
import org.apache.log4j.Logger;
/**
 *
 * @author mb
 */
public class GiraphJobRunner implements Tool{
    
    private static final Logger LOG = Logger.getLogger(GiraphJobRunner.class);
    private Configuration conf = new Configuration();

    public static void main(String [] args) throws Exception{
        System.exit(ToolRunner.run(new GiraphJobRunner(), args));
    }

    @Override
    public int run(String[] strings) throws Exception {
        
    GiraphConfiguration gconf = new GiraphConfiguration(conf);   

    CommandLine cmd = ConfigurationUtils.parseArgs(gconf, strings);
    if(null==cmd){
        return 0;
    }
    GiraphJob job = new GiraphJob(gconf,getClass().getName());
    job.getInternalJob().setJarByClass(getClass());
    if (cmd.hasOption("vof") || cmd.hasOption("eof")) {
      if (cmd.hasOption("op")) {
          Path outputPath = new Path(cmd.getOptionValue("op"));
        
        FileSystem fs = FileSystem.get(outputPath.toUri(),conf);
        if (fs.exists(outputPath)) {
            fs.delete(outputPath, true);
        }
        
        FileOutputFormat.setOutputPath(job.getInternalJob(),
          outputPath);
      }
    }

    if(cmd.hasOption("ca")){
    String[] args = cmd.getOptionValues("ca");
    gconf.set("ca",args[0].split("=")[1]);
    gconf.setWorkerConfiguration(Integer.parseInt(cmd.getOptionValue("w")),
                               Integer.parseInt(cmd.getOptionValue("w")),
                               100.0f);
    }

    return job.run(true) ? 0 : -1;
    }

    static {
    Configuration.addDefaultResource("giraph-site.xml");
  }

  @Override
  public Configuration getConf() {
    return conf;
  }

  @Override
  public void setConf(Configuration conf) {
    this.conf = conf;
  }

}
