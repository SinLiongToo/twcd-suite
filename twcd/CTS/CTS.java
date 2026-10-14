import java.awt.*;
import java.awt.image.*;
import java.awt.event.*;
import java.io.*;
import java.util.*;
import javax.swing.*;
import javax.swing.event.*;

public class CTS extends JFrame implements ActionListener {	

	Container c;
	File GetFile;
	JLabel lab_img = new JLabel();
	
	JPanel  jp      = new JPanel(new GridLayout(5,1));
	JPanel  jp_load = new JPanel();
	JPanel  jp_save = new JPanel();
	JPanel  jp_conf = new JPanel(new GridLayout(2,5));
  JPanel  jp_go   = new JPanel();
  JPanel  jp_info = new JPanel();
  int delay=0;

	JButton jbt_load = new JButton("選擇輸入檔案 (僅支援文字檔，檔名中請不要有空白)");
	JButton jbt_save = new JButton("選擇輸出檔案 (僅支援文字檔)");
	JButton jbt_go   = new JButton("執行");
	
	JRadioButton jrb_iec1 = new JRadioButton("教羅數字編碼");
	JRadioButton jrb_iec2 = new JRadioButton("TP");
	JRadioButton jrb_iec3 = new JRadioButton("HOTSYS");
	JRadioButton jrb_iec4 = new JRadioButton("教羅Unicode");
    JRadioButton jrb_iec5 = new JRadioButton("台羅Unicode");
    JRadioButton jrb_iec6 = new JRadioButton("台羅數字編碼");

	JRadioButton jrb_oec1 = new JRadioButton("教羅Unicode");
	JRadioButton jrb_oec2 = new JRadioButton("教羅數字編碼");
	JRadioButton jrb_oec3 = new JRadioButton("TP");
	JRadioButton jrb_oec4 = new JRadioButton("HOTSYS");
    JRadioButton jrb_oec5 = new JRadioButton("台羅Unicode");
    JRadioButton jrb_oec6 = new JRadioButton("台羅數字編碼");

  JLabel jlb_info = new JLabel("");

  ButtonGroup bg_i = new ButtonGroup();
  ButtonGroup bg_o = new ButtonGroup();
  
  
  javax.swing.Timer timer = new javax.swing.Timer(1000,this);
  
	String InputFile;
	String OutputFile = "ans.txt";
	String IEC;
	String OEC;
	
	public CTS()
	{	
		super("CTS 0.9");
		
		c=getContentPane();
    
		c.add(jp);
		
		bg_i.add(jrb_iec1);
		bg_i.add(jrb_iec2);
		bg_i.add(jrb_iec3);
		bg_i.add(jrb_iec4);
        bg_i.add(jrb_iec5);
        bg_i.add(jrb_iec6);
		bg_o.add(jrb_oec1);
		bg_o.add(jrb_oec2);
		bg_o.add(jrb_oec3);
		bg_o.add(jrb_oec4);   
        bg_o.add(jrb_oec5);
        bg_o.add(jrb_oec6);
		
    jp_load.setBorder(BorderFactory.createTitledBorder("Step 1"));
    jp_save.setBorder(BorderFactory.createTitledBorder("Step 2"));
    jp_conf.setBorder(BorderFactory.createTitledBorder("Step 3"));
    jp_go.setBorder(BorderFactory.createTitledBorder("Step 4"));
    jp_info.setBorder(BorderFactory.createTitledBorder("Step 5"));
		
		jp_conf.add(new JLabel("輸入編碼:"));
		jp_conf.add(jrb_iec1);
		jp_conf.add(jrb_iec2);
		jp_conf.add(jrb_iec3);
		jp_conf.add(jrb_iec4);
        jp_conf.add(jrb_iec5);
        jp_conf.add(jrb_iec6);
		jp_conf.add(new JLabel("輸出編碼:"));
		jp_conf.add(jrb_oec1);
		jp_conf.add(jrb_oec2);
		jp_conf.add(jrb_oec3);
		jp_conf.add(jrb_oec4);
        jp_conf.add(jrb_oec5);
        jp_conf.add(jrb_oec6);
		
		jp.add(jp_load);
		jp.add(jp_save);
		jp.add(jp_conf);
		jp.add(jp_go);
    jp.add(jp_info);
    
		jp_load.add(jbt_load);
    jp_save.add(jbt_save);
    jp_go.add(jbt_go);
		jp_info.add(jlb_info);
		
	  jbt_load.addActionListener(this);
	  jbt_save.addActionListener(this);
	  jbt_go.addActionListener(this);
		jrb_iec1.addActionListener(this);
		jrb_iec2.addActionListener(this);
		jrb_iec3.addActionListener(this);
	    jrb_iec4.addActionListener(this);
        jrb_iec5.addActionListener(this);
        jrb_iec6.addActionListener(this);
		jrb_oec1.addActionListener(this);
		jrb_oec2.addActionListener(this);
		jrb_oec3.addActionListener(this);
		jrb_oec4.addActionListener(this);
        jrb_oec5.addActionListener(this);
        jrb_oec6.addActionListener(this);
		
		setLocation(200,200);
		setSize(750,350);
		setVisible(true);
		//show();

  }

	
  public void actionPerformed(ActionEvent e){
  	
  	if( e.getSource()==jbt_load ){
		  JFileChooser jfc = new JFileChooser("./");
	    int	rst = jfc.showOpenDialog(this);
		  if(rst==JFileChooser.APPROVE_OPTION){
		  	InputFile = jfc.getSelectedFile().toString();
		  }
		}else if( e.getSource()==jbt_save ){
		  JFileChooser jfc = new JFileChooser("./");
	    int	rst = jfc.showSaveDialog(this);
		  if(rst==JFileChooser.APPROVE_OPTION){
		  	OutputFile = jfc.getSelectedFile().toString();
            if (OutputFile.indexOf(".txt")<0 && OutputFile.indexOf(".TXT")<0)
                OutputFile=OutputFile+".txt";
		  }
		}else if( e.getSource()==jbt_go ){
			if( InputFile==null )       jlb_info.setText("無設定輸入檔案");
			else if( OutputFile==null ) jlb_info.setText("無設定輸出檔案");
			else if( IEC==null )        jlb_info.setText("無設定輸入編碼");
			else if( OEC==null )        jlb_info.setText("無設定輸出編碼");
			else{
        jlb_info.setText("Processing");
        GetFile = new File(OutputFile);
        GetFile.delete();
			  timer.start();
		    try	{
			    Process process = Runtime.getRuntime().exec("php/php.exe cmdCTS.php "+IEC+" "+OEC+" \""+InputFile+"\"  \""+OutputFile+"\"");
                InputStream stderr = process.getInputStream();
                InputStreamReader isr = new InputStreamReader(stderr);
                BufferedReader br = new BufferedReader(isr);
                String line = null;
                //System.out.println("<ERROR>");
                while ( (line = br.readLine()) != null);
                    //  System.out.println(line);
                  //System.out.println("</ERROR>");
                    int exitVal = process.waitFor();
                //int exitVal = process.exitValue();
			   //System.out.println(exitVal+"cmdcts.exe "+IEC+" "+OEC+" \""+InputFile+"\"  \""+OutputFile+"\"");
		    }	catch (Exception ii) {
                System.out.println("Fail"+ii.toString());
		      jlb_info.setText("Fail");
		    }
		  }
		}else if( e.getSource()==jrb_iec1 ){
      IEC = "0";
         /************************/
		}else if( e.getSource()==jrb_iec2 ){
      IEC = "1";
   
		}else if( e.getSource()==jrb_iec3 ){
      IEC = "2";
		}else if( e.getSource()==jrb_iec4 ){
      IEC = "3";
      }else if( e.getSource()==jrb_iec5 ){
      IEC = "4";
      /*********************/
		}else if( e.getSource()==jrb_iec6 ){
      IEC = "5";
		}else if( e.getSource()==jrb_oec1 ){
      OEC = "0";
		}else if( e.getSource()==jrb_oec2 ){
      OEC = "1";
      /**********************/
		}else if( e.getSource()==jrb_oec3 ){
      OEC = "2";
		}else if( e.getSource()==jrb_oec4 ){
      OEC = "3";
		}else if( e.getSource()==jrb_oec5 ){
      OEC = "4";
       /*******************/
		}else if( e.getSource()==jrb_oec6 ){
      OEC = "5";
		}else{
		  if( GetFile.exists() ){
                  timer.stop();
                  jlb_info.setText("Complete");
		  }else{
		    jlb_info.setText(jlb_info.getText()+".");
            delay=0;
		  }
		}

  }


  
	public void paint( Graphics g )	{
		super.paint(g);
	}

  
	public static void main(String args[]) throws Exception
	{
		CTS app=new CTS();
		app.addWindowListener(new WindowAdapter(){
			public void windowClosing(WindowEvent e)
			{
				System.exit(0);
			}
		});
	}
	
}
