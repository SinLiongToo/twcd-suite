/*****************************************
2013.02.14 處理替換順序
2013.01.23 處理標點符號替換位置與大寫保留
2012.12.28 增加uniocde轉換檔
2009.04.18 增加顯示控制檔名msgctl.txt
全羅轉漢羅執行檔 rh.bat
漢羅轉全羅執行檔 hr.bat
檔名改掉
unicode漢羅轉全羅一般片語檔 uh1_phrase.txt
unicode漢羅轉全羅專有名詞檔 uh1_spec.txt
unicode漢羅轉全羅不應轉換檔 uh1_notran.txt
unicode全羅轉漢羅一般片語檔 ulh_phrase.txt
unicode全羅轉漢羅專有名詞檔 ulh_spec.txt
unicode全羅轉漢羅不應轉換檔 ulh_notran.txt
*************************************************/
import java.awt.*;
import javax.swing.*;
import java.awt.event.*;
import java.net.*;
//想想還有沒有其他的東西要import
import java.io.*;
import java.util.*;
import java.text.DecimalFormat;
 class cc<T> implements Comparator<T>
{
    public int compare(Object o1, Object o2)
    {
         return ((lookup_table)o2).code.length() - ((lookup_table)o1).code.length();
    }
    public boolean equals(Object obj)
    {
        return false;
    }
}

class lookup_table
{
    int length;
    String code;
    String word;
}
public class lh extends JApplet implements ActionListener,ItemListener //名稱改一改
{
    Container c;
    //設定UI元件
    static JFrame f;
    JTextArea RB,HB;
    JLabel RBt,HBt,hpht,rpht,sfilet;
    JButton bot0,bot1,bot2,bot3,bot4,bot5,bot6,bot7,bot8;
    JRadioButton clrb,tlrb;
    ButtonGroup cl_tl_rg = new ButtonGroup();
    JCheckBox ck1;
    JTextField hph,rph,sfile;
    JScrollPane jscpr,jscph;
    JPanel jp1,jp2,jp3,jp4;
    String BUF;
    String phrase_name,spec_name,notran_name;
    lookup_table spec[];
    lookup_table phase[];
    lookup_table notran[];
    JFrame wait_frame=new JFrame("處理中請稍待");
    JLabel wait_lab=new JLabel("處理中請稍待！");
    int maxscnt=10000;//最多一萬個專有名詞
    int maxnocnt=1000;//最多一千個強迫不轉
    int maxphcnt=60000;//最多6萬個片語
    static int applet=1;
    static int to_han=1;//1轉漢羅 0轉全羅
    static int cl_tl=0;//1台羅 0教羅
    String trantmp,ntrantmp,EPAD="";
    int phcnt,scnt,nocnt;
    String msgarray[]={"漢羅轉換程式","目的","來源","漢字片語","羅馬字","存檔名稱","教羅","台羅","結束","清除","片語排序","專有名詞排序"
                               ,"全羅(LMJ)choan漢羅","加入片語","加入專有名詞","加入不轉","漢羅choan全羅(LMJ)","全選"};
    //設定共用的變數與類別
    public void init()   //建構元，名稱改一改
    {
        c=getContentPane();//取得ContentPane
        /*****
        Font sysFont = new Font("MOESongUN", Font.PLAIN, 12);  
UIManager.put("TextField.font", sysFont);  
UIManager.put("TextArea.font", sysFont); 
UIManager.put("Label.font", sysFont);
******/
        for (int i=0;i<256;i++)
                  EPAD=EPAD+"=";
	//設定版面設定
         try
        {
            BufferedReader fr;
            if (applet==0)
            {
                InputStreamReader read = new InputStreamReader(new FileInputStream("msgctl.txt"),"utf-8");
                fr=new BufferedReader(read);
                //fr= new BufferedReader(new FileReader("msgctl.txt"));
            }
            else
            {
                URL ud1=new URL(getDocumentBase(),"msgctl.txt");
                fr = new BufferedReader(new InputStreamReader(ud1.openStream(),"utf-8"));
            }
            StringTokenizer stk;
            String getfr;
            int i=0;
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                //getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr,"#\n\t"); //取得token
                msgarray[i++]=stk.nextToken().trim();
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
        };
        c.setLayout(new BoxLayout(c,BoxLayout.Y_AXIS));
	//初始化UI元件
	 if (applet==0)
       f.setTitle(msgarray[0] +"4.2 unicode版");
        jp1=new JPanel();
        jp2=new JPanel();
        jp3=new JPanel();
        jp4=new JPanel();
        jp1.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp2.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp3.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp4.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        RBt=new JLabel(msgarray[1]);//目的
        HBt=new JLabel(msgarray[2]);//來源
        hpht=new JLabel(msgarray[3]);//漢字片語
        rpht=new JLabel(msgarray[4]);//羅馬字
        sfilet=new JLabel(msgarray[5]);//存檔名稱
        clrb=new JRadioButton(msgarray[6],true);//"教羅"
        tlrb=new JRadioButton(msgarray[7]);//台羅
        cl_tl_rg.add(clrb);
        cl_tl_rg.add(tlrb);
        hph=new JTextField(8);
        rph=new JTextField(10);
        sfile=new JTextField(8);
        RB=new JTextArea(18,50);
        //RB.setFont(new Font("細明體",Font.PLAIN,14));
        RB.setDefaultLocale(Locale.TRADITIONAL_CHINESE );
        //RB.setDefaultLocale(Locale.TAIWAN );
        RB.setLineWrap(true);
        BUF=new String("");
        jscpr=new JScrollPane(RB);
        HB=new JTextArea(8,50);
        HB.setDefaultLocale(Locale.TRADITIONAL_CHINESE );
        HB.setLineWrap(true);
        jscph=new JScrollPane(HB);
        bot0=new JButton(msgarray[8]);//結束
        bot6=new JButton(msgarray[9]);//清除
        bot1=new JButton(msgarray[10]);//片語排序
        bot2=new JButton(msgarray[11]);//專有名詞排序
        bot3=new JButton(msgarray[12]);//全羅(LMJ)choan漢羅
        bot4=new JButton(msgarray[13]);//加入片語
        bot5=new JButton(msgarray[14]);//加入專有名詞
        bot7=new JButton(msgarray[15]);//加入不轉
        bot8=new JButton(msgarray[16]);//漢羅choan全羅(LMJ)
        ck1=new JCheckBox(msgarray[17]);//全選
        if (to_han==0) //轉全羅
        {
            phrase_name="uhl_phrase.txt";
            spec_name="uhl_spec.txt";
            notran_name="uhl_notran.txt";
        }
        else if (to_han==1) //轉漢羅
        {
            phrase_name="ulh_phrase.txt";
            spec_name="ulh_spec.txt";
            notran_name="ulh_notran.txt";
        }
	//將UI元件加入ContentPane
        jp1.add(hpht);
        jp1.add(hph);
        jp1.add(rpht);
        jp1.add(rph);
        jp1.add(bot4);
        jp1.add(bot5);
        jp1.add(bot7);
        jp2.add(HBt);
        jp2.add(jscph);
        jp3.add(RBt);
        jp3.add(jscpr);
        /**************
        if (applet==0)
        {
            jp4.add(sfilet);
            jp4.add(sfile);
            jp4.add(bot1);
            jp4.add(bot2);
        }
       *****************/
        jp4.add(clrb);//羅馬拼音標準選定
        jp4.add(tlrb);
        if (to_han==1)
            jp4.add(bot3);
        else if (to_han==0)
            jp4.add(bot8);
        else if (to_han==2)//used by test
        {
            jp4.add(bot3);
            jp4.add(bot8);
        }
        jp4.add(bot6);
        if (applet==0)
        {
            jp4.add(bot0);
            c.add(jp1);
        }
        jp4.add(ck1);
        c.add(jp2);c.add(jp3);c.add(jp4);
        wait_frame.setSize(200,100);
        wait_frame.setLocation(200,200);
        wait_frame.getContentPane().add(wait_lab);
        bot0.addActionListener(this);
        bot1.addActionListener(this);
        bot2.addActionListener(this);
        bot3.addActionListener(this);
        bot4.addActionListener(this);
        bot5.addActionListener(this);
        bot6.addActionListener(this);
        bot7.addActionListener(this);
        bot8.addActionListener(this);
        ck1.addItemListener(this);
        spec=new lookup_table[maxscnt];
        phase=new lookup_table[maxphcnt];
        notran=new lookup_table[maxnocnt];
        spec_read(spec_name);
        ph_read(phrase_name);
        no_read(notran_name);
	//設定UI元件與滑鼠的事件觸發傾聽者
	//setSize(640,480);//設定size，顯示出去
	//show();
    }
        //專有名詞讀檔
    private void spec_read(String fname)
    {
        StringTokenizer stk;
        String getfr,word,code,id;
        scnt=0;
        BufferedReader fr;
        try
        {
            if (applet==0)
            {
                InputStreamReader read = new InputStreamReader(new FileInputStream(fname),"utf-8");
                fr=new BufferedReader(read);
                //fr= new BufferedReader(new FileReader(fname));
            }
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream(),"utf-8"));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                //getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token
                id=stk.nextToken();
                word=stk.nextToken();
                spec[scnt]=new lookup_table();
                //s_word[scnt]=word;
                spec[scnt].word=word.replace('%',' ');
                code=getfr.substring(id.length()+word.length()+2);
                code=code.trim();
                //s_code[scnt]=code;
                spec[scnt].code=code;
                //spec[scnt].length=spec[scnt].word.length();
                spec[scnt].length=Integer.parseInt(id.trim().substring(1));
                scnt=scnt+1;
                if (scnt>=maxscnt)
                    System.out.println("太多專有名詞了，請改 maxscnt");
                //System.out.println("word="+word+"||code="+code+"||");
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
            System.out.println("fname="+fname+"開啟error!"+e+"  "+scnt);
            HB.setText("fname="+fname+"開啟error!"+e+"   "+scnt);
        };
    }
    //片語讀檔
    private void ph_read(String fname)
    {
        StringTokenizer stk;
        String getfr,word,code,id;
        String RS;
        phcnt=0;
        BufferedReader fr;
        try
        {
            if (applet==0)
            {
                InputStreamReader read = new InputStreamReader(new FileInputStream(fname),"utf-8");
                fr=new BufferedReader(read);
                //fr= new BufferedReader(new FileReader(fname));
            }
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream(),"utf-8"));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                //getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token

                    id=stk.nextToken();
                    word=stk.nextToken();
                    phase[phcnt]=new lookup_table();
                    phase[phcnt].word=word.replace('%',' ');
                    //ph_word[phcnt]=word;
                    code=getfr.substring(id.length()+word.length()+2);
                    code=code.trim();
                    //ph_code[phcnt]=code;
                    phase[phcnt].code=code;
                    phase[phcnt].length=Integer.parseInt(id.trim().substring(1));
                    phcnt=phcnt+1;
                    if (phcnt>=maxphcnt)
                        System.out.println("太多片語了，請改 maxphcnt");
                
                //System.out.println("word="+word+"||code="+code+"||");
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
            System.out.println("fname="+fname+"開啟error!"+e+"   "+phcnt);
            HB.setText("fname="+fname+"開啟error!"+e+"   "+phcnt);
        };
       
    }
     //強迫不轉讀檔
    private void no_read(String fname)
    {
        String getfr,word,code;
        String RS;
        int id;
        nocnt=0;
        BufferedReader fr=null;
        try
        {
            if (applet==0)
            {
                InputStreamReader read = new InputStreamReader(new FileInputStream(fname),"utf-8");
                fr=new BufferedReader(read);
                //fr= new BufferedReader(new FileReader(fname));
            }
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream(),"utf-8"));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                code=getfr.trim();
                word="";
                for (id=0;id<code.length();id++)
                    word=word+"=";
                if (code.length()==0) continue;
                notran[nocnt]=new lookup_table();
                notran[nocnt].word=word;
                notran[nocnt].code=code;
                //notran[nocnt].length=notran[nocnt].word.length();
                notran[nocnt].length=notran[nocnt].word.getBytes().length;
                nocnt=nocnt+1;
                if (nocnt>=maxnocnt)
                    System.out.println("太多強迫不轉詞了，請改 maxnocnt");
                //System.out.println("word="+word+"||\ncode="+code+"||");
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
            System.out.println("fname="+fname+"開啟error!"+e.toString());
            HB.setText("fname="+fname+"開啟error!");
        };
       
    }
    public void paint(Graphics g)  
    {
	    super.paint(g);//畫出元件
	    //額外的畫圖程式寫在這裡
    }
    //UI元件事件處理類別寫在這裡
    public void actionPerformed(ActionEvent e) //按鈕事件的處理方法
    { 
        if (e.getSource()==bot0)
        {
                System.exit(0);
        }
        else if (e.getSource()==bot1) //片語轉換
        {
            //spec_tran("SPEC");
              ph_read(phrase_name);
              cp_ph(phrase_name,phase);
        }
        else if (e.getSource()==bot2) //專有名詞
        {
            //ph_tran("phase.hr","HRS");
            spec_read(spec_name);
              cp_ph(spec_name,spec);
        }
        else if (e.getSource()==bot3) //全部轉換
        {
            wait_frame.setVisible(true);
            wait_lab.setText("處理中請稍候！");
            wait_frame.paint(wait_frame.getGraphics());
            if (tlrb.isSelected())
            {
                BUF=tl2cl(HB.getText());
            }
            /******
            spec_tran(spec_name);
            BUF=RB.getText();
            ph_tran(phrase_name,"HRS");
            *******/
            all_tran();
            post_tran();//處理標點空白與字首大寫
            //教羅與台羅
            if (tlrb.isSelected())
            {
                RB.setText(cl2tl(RB.getText()));
            }
            BUF=new String("");
            if (sfile.getText().trim().length()>0)
            {
                try
                {
                   // BufferedWriter fp= new BufferedWriter(new FileWriter(sfile.getText().trim()));
                    OutputStreamWriter fp = new OutputStreamWriter(new FileOutputStream(sfile.getText().trim()),"utf-8"); 
                    fp.write(RB.getText());
                    fp.flush();
                    fp.close();
                }
                catch(Exception e1)
                {
                    System.out.println(e1.toString()+"fname="+sfile.getText().trim()+"開啟error!");
                };
            }
            wait_frame.setVisible(false);
        }
        else if (e.getSource()==bot4) //加入片語
        {
            add_tran2(phrase_name,1);
            ph_read(phrase_name);
        }
        else if (e.getSource()==bot5) //加入專有名詞
        {
            add_tran2(spec_name,0);
            spec_read(spec_name);
        }
        else if (e.getSource()==bot6) //清除
        {
            HB.setText("");
            RB.setText("");
        }
        else if (e.getSource()==bot7) //加入不轉
        {
            add_no(notran_name);
            no_read(notran_name);
        }
        else if (e.getSource()==bot8) //漢字轉羅馬字
        {
            wait_frame.setVisible(true);
            wait_lab.setText("處理中請稍候！");
            wait_frame.paint(wait_frame.getGraphics());
            if (tlrb.isSelected())
            {
                BUF=tl2cl(HB.getText());
            }
            /********all
            bspec_tran();
            BUF=RB.getText();
            bph_tran();
            ********/
            ball_tran();
            RB.setText(RB.getText().replaceAll("  "," "));
            //教羅與台羅
            if (tlrb.isSelected())
            {
                RB.setText(cl2tl(RB.getText()));
            }
            BUF=new String("");
            if (sfile.getText().trim().length()>0)
            {
                try
                {
                    //BufferedWriter fp= new BufferedWriter(new FileWriter(sfile.getText().trim()));
                    OutputStreamWriter fp = new OutputStreamWriter(new FileOutputStream(sfile.getText().trim()),"utf-8"); 
                    fp.write(RB.getText());
                    fp.close();
                }
                catch(Exception e1)
                {
                    System.out.println(e1.toString()+"fname="+sfile.getText().trim()+"開啟error!");
                };
            }
            wait_frame.setVisible(false);
        }
        
    }
    public void itemStateChanged(ItemEvent e) //checkbox事件的處理方法
    {
        FocusAdapter ff;
        ff=new FocusAdapter() {
                public void focusLost(FocusEvent e) {}
                public void focusGained(FocusEvent e) {
                    RB.selectAll();
                }
            };
        if (e.getSource()==ck1 && ck1.isSelected())
        {
             
            RB.requestFocus();
            RB.addFocusListener(ff);
            //
            repaint();
        }
        else
        {
            RB.removeFocusListener(ff);
        }
    }
    private void add_no(String fname)//加入強制不轉
    {
        DecimalFormat df = new DecimalFormat("000");//設定格式
        StringTokenizer stk;
        String word,code,getfr,now_word,now_code,now_id;
        int id,flag,flag1;
        if (tlrb.isSelected())
        {
                word=tl2cl(hph.getText().trim());
                code=tl2cl(rph.getText().trim());
        }
        else
        {
            word=hph.getText().trim();
            code=rph.getText().trim();
        }
        if (code.length()==0) return;
        byte[] len=code.getBytes();
        code=code.replace('A','a');
            code=code.replace('B','b');
            code=code.replace('C','c');
            code=code.replace('D','d');
            code=code.replace('E','e');
            code=code.replace('F','f');
            code=code.replace('G','g');
            code=code.replace('H','h');
            code=code.replace('I','i');
            code=code.replace('J','j');
            code=code.replace('K','k');
            code=code.replace('L','l');
            code=code.replace('M','m');
            code=code.replace('O','o');
            code=code.replace('P','p');
            code=code.replace('Q','q');
            code=code.replace('R','r');
            code=code.replace('S','s');
            code=code.replace('T','t');
            code=code.replace('U','u');
            code=code.replace('V','v');
            code=code.replace('W','w');
            code=code.replace('X','x');
            code=code.replace('Y','y');
            code=code.replace('Z','z');
        File f1=new File(fname+".bak");
        File f2=new File(fname);
        f2.renameTo(f1);
        try
        {
            //BufferedWriter fp= new BufferedWriter(new FileWriter(fname));
            OutputStreamWriter fp = new OutputStreamWriter(new FileOutputStream(fname),"utf-8"); 
            //BufferedReader fr= new BufferedReader(new FileReader(f1));
            BufferedReader fr= new BufferedReader(new InputStreamReader(new FileInputStream(f1),"utf-8"));
            flag=0;
            while (fr.ready())//如果檔案沒有讀完，就繼續處理
            {
                flag1=1;
                now_code = fr.readLine(); //取得一行輸入
                if (now_code.trim().length()==0) continue; //跳過空白

                now_code=now_code.trim();
                //判斷重複
                if (now_code.equals(code) )
                {
                     String message="不轉資料庫已經有了!";
                     int messageType=JOptionPane.QUESTION_MESSAGE;
                     int optionType=	JOptionPane.YES_NO_OPTION ;
                     String[] option={"確定","取消"};
                     int YN=JOptionPane.showOptionDialog(this,message,
                     "不轉資料庫重複",optionType,messageType,null,option,
                     option[0]);
                     flag=1;
                }
                
                if (flag==0)
                {
                    fp.write(code+"\r\n");
                    flag=1;
                }
                if (flag1==1)
                {
                    fp.write(now_code.trim()+"\r\n");
                }
                else flag1=1;
                
            }//while fr.ready()
            if (flag==0)//沒換到
            {
                fp.write(code+"\r\n");
            }
            fr.close(); //close file
            fp.flush();
            fp.close(); //close file
        }
        catch(Exception e){
            System.out.println(e.toString()+"add_no fname="+fname+"開啟error!");
        };
        hph.setText("");
        rph.setText("");
        f1.delete();//砍掉bak
    }
    //轉換片語或專有名詞進入記憶體中
    private void cp_ph(String fname,lookup_table lookup[])
    {
        DecimalFormat df = new DecimalFormat("000");//設定格式
        StringTokenizer stk;
        int id,flag,flag1;
        int i,cnt=0;
        byte[] len;
        Comparator <lookup_table> scc=new cc<lookup_table>();
        File f1=new File(fname+".bak");
        File f2=new File(fname);
        f2.renameTo(f1);
        //sort
        Arrays.sort(lookup,0,scnt,scc);
        try
        {
            //BufferedWriter fp= new BufferedWriter(new FileWriter(fname));
            OutputStreamWriter fp = new OutputStreamWriter(new FileOutputStream(fname),"utf-8"); 
            
	    //看看輸入什麼檔案，就用哪一個計數器
	    if (fname.equals(phrase_name))
		    cnt=phcnt;
	    else  if (fname.equals(spec_name))
		    cnt=scnt;
            for (i=0;i<cnt;i=i+1)
            {
                    //RS=replace(RS,s_code[i],s_word[i]);
                    len=lookup[i].code.getBytes();
                    fp.write(df.format(len.length)+" "+lookup[i].word+" "+lookup[i].code+"\r\n");
                    //fp.newLine();
            }
            fp.close(); //close file
        }
        catch(Exception e){
            System.out.println(e.toString()+"fname="+fname+"改寫error!");
        };

        hph.setText("");
        rph.setText("");
        f1.delete();//砍掉bak
    }
    //加入片語或專有名詞
    private void add_tran2(String fname,int mode)
    {//mode=0 保持大小寫，mode=1 轉換成小寫
        DecimalFormat df = new DecimalFormat("000");//設定格式
        StringTokenizer stk;
        String word,code,getfr,now_word,now_code,now_id;
        int id,flag,flag1;
        byte[] now_byte;
        if (tlrb.isSelected())
        {
                word=tl2cl(hph.getText().trim());
                code=tl2cl(rph.getText().trim());
        }
        else
        {
            word=hph.getText().trim();
            code=rph.getText().trim();
        }
        //System.out.println("word="+word+" code="+code+" "+word.indexOf(" "));
        word=word.replace(' ','%');//把空白換成 %
        if (mode==1)
        {
            code=code.replace('A','a');
            code=code.replace('B','b');
            code=code.replace('C','c');
            code=code.replace('D','d');
            code=code.replace('E','e');
            code=code.replace('F','f');
            code=code.replace('G','g');
            code=code.replace('H','h');
            code=code.replace('I','i');
            code=code.replace('J','j');
            code=code.replace('K','k');
            code=code.replace('L','l');
            code=code.replace('M','m');
            code=code.replace('O','o');
            code=code.replace('P','p');
            code=code.replace('Q','q');
            code=code.replace('R','r');
            code=code.replace('S','s');
            code=code.replace('T','t');
            code=code.replace('U','u');
            code=code.replace('V','v');
            code=code.replace('W','w');
            code=code.replace('X','x');
            code=code.replace('Y','y');
            code=code.replace('Z','z');
        }
        if (word.length()==0||code.length()==0) return;
        if (word.equals(code)) 
        {
            JOptionPane.showMessageDialog(null,"漢字和羅馬字重複！錯誤！");
            return;//word 換成 code一樣會出事
        }
        byte[] len;
        if (to_han==1)
            len=code.getBytes();
        else len=word.getBytes();
        File f1=new File(fname+".bak");
        File f2=new File(fname);
        f2.renameTo(f1);
        //System.out.println(fname+"    "+f1);
        try
        {
            //BufferedWriter fp= new BufferedWriter(new FileWriter(fname));
            OutputStreamWriter fp = new OutputStreamWriter(new FileOutputStream(fname),"utf-8"); 
            //BufferedReader fr= new BufferedReader(new FileReader(f1));
            BufferedReader fr= new BufferedReader(new InputStreamReader(new FileInputStream(f1),"utf-8"));
            flag=0;
            while (fr.ready())//如果檔案沒有讀完，就繼續處理
            {
                flag1=1;
                getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token
                now_id=stk.nextToken();
                id=Integer.parseInt(now_id.substring(1));
                now_word=stk.nextToken();
                now_code=getfr.substring(now_id.length()+now_word.length()+2);
                now_code=now_code.trim();
                //判斷重複
                if (to_han==0) //漢羅轉全羅模式
                {
                    if (now_code.equals(code) && now_word.equals(word))
                    {
                         String message="資料庫已經有了!code="+code+" word="+word+
                         " now_word="+now_word+" now_code="+now_code  ;
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "資料庫重複",optionType,messageType,null,option,
                         option[0]);
                         flag=1;
                    }
                    else if (!now_code.equals(code) && now_word.equals(word))
                    {
                         String message="漢字重複，是否覆蓋？";
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "漢字重複",optionType,messageType,null,option,
                         option[0]);
                         if (YN==JOptionPane.YES_OPTION)
                             flag1=0;
                         else flag=1;
                    }
                    else if (now_code.equals(code) && !now_word.equals(word))
                    {
                         String message="羅馬字重複，是否增加？";
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "羅馬字重複",optionType,messageType,null,option,
                         option[0]);
                         if (YN==JOptionPane.YES_OPTION)
                             flag=0;
                         else flag=1;
                    }
                }
                else if (to_han==1) //全羅轉漢羅模式
                {
                    if (now_code.equals(code) && now_word.equals(word))
                    {
                         String message="資料庫已經有了!code="+code+" word="+word+
                         " now_word="+now_word+" now_code="+now_code  ;
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "資料庫重複",optionType,messageType,null,option,
                         option[0]);
                         flag=1;
                    }
                    else if (now_code.equals(code) && !now_word.equals(word))
                    {
                         String message="羅馬字重複，是否覆蓋？";
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "羅馬字重複",optionType,messageType,null,option,
                         option[0]);
                         if (YN==JOptionPane.YES_OPTION)
                             flag1=0;
                         else flag=1;
                    }
                    else if (!now_code.equals(code) && now_word.equals(word))
                    {
                         String message="漢字重複，是否增加？";
                         int messageType=JOptionPane.QUESTION_MESSAGE;
                         int optionType=	JOptionPane.YES_NO_OPTION ;
                         String[] option={"確定","取消"};
                         int YN=JOptionPane.showOptionDialog(this,message,
                         "漢字重複",optionType,messageType,null,option,
                         option[0]);
                         if (YN==JOptionPane.YES_OPTION)
                             flag=0;
                         else flag=1;
                    }
                }
                if (len.length>id && flag==0)
                {
                    fp.write(df.format(len.length)+" "+word+" "+code+"\r\n");
                    //fp.newLine();
                    flag=1;
                }
                if (flag1==1)
                {
                    if (to_han==0)
                        now_byte=now_word.getBytes();
                    else
                        now_byte=now_code.getBytes();
                    fp.write(df.format(now_byte.length)+" "+now_word+" "+now_code+"\r\n");
                    //fp.write(getfr.trim());
                    //fp.newLine();
                }
                else flag1=1;
                
            }//while fr.ready()
            if (flag==0)//沒換到
            {
                fp.write(df.format(len.length)+" "+word+" "+code+"\r\n");
                //fp.newLine();
            }
            fr.close(); //close file
            fp.flush(); //close file
            fp.close(); //close file
        }
        catch(Exception e){
            System.out.println(e.toString()+"fname="+fname+"開啟error!");
        };
        hph.setText("");
        rph.setText("");
        f1.delete();//砍掉bak
    }
    //台羅轉教羅
    private String tl2cl(String str)
    {
        String txt=str;
        txt=txt.replaceAll("ts","ch");
        txt=txt.replaceAll("oo","ou");
        txt=txt.replaceAll("ua","oa");
        txt=txt.replaceAll("ue","oe");
        txt=txt.replaceAll("ing","eng");
        txt=txt.replaceAll("ik","ek");
        txt=txt.replaceAll("Ts","Ch");
        txt=txt.replaceAll("Oo","Ou");
        txt=txt.replaceAll("Ua","Oa");
        txt=txt.replaceAll("Ue","Oe");
        txt=txt.replaceAll("Ing","Eng");
        txt=txt.replaceAll("Ik","Ek");
        txt=txt.replaceAll("nn","N");
        return txt;
    }
    //教羅轉台羅
    private String cl2tl(String str)
    {
        String txt=str;
        txt=txt.replaceAll("ch","ts");
        txt=txt.replaceAll("ou","oo");
        txt=txt.replaceAll("oa","ua");
        txt=txt.replaceAll("oe","ue");
        txt=txt.replaceAll("eng","ing");
        txt=txt.replaceAll("ek","ik");
        txt=txt.replaceAll("Ch","Ts");
        txt=txt.replaceAll("Ou","Oo");
        txt=txt.replaceAll("Oa","Ua");
        txt=txt.replaceAll("Oe","Ue");
        txt=txt.replaceAll("Eng","Ing");
        txt=txt.replaceAll("Ek","Ik");
        txt=txt.replaceAll("N","nn");
        return txt;
    }
     //後轉換
    private void post_tran()
    {
        String getfr,word,code,id;
        String RS;
        int i;
            RS=RB.getText();
        while ((i=RS.indexOf("， "))>=0)
        {
            RS=RS.substring(0,i)+"，"+RS.substring(i+2);
        }
        while ((i=RS.indexOf("。 "))>=0)
        {
            RS=RS.substring(0,i)+"。"+RS.substring(i+2);
        }
        while ((i=RS.indexOf("？ "))>=0)
        {
            RS=RS.substring(0,i)+"？"+RS.substring(i+2);
        }
        while ((i=RS.indexOf("！ "))>=0)
        {
            RS=RS.substring(0,i)+"！"+RS.substring(i+2);
        }
        while ((i=RS.indexOf("； "))>=0)
        {
            RS=RS.substring(0,i)+"；"+RS.substring(i+2);
        }
        while ((i=RS.indexOf("： "))>=0)
        {
            RS=RS.substring(0,i)+"："+RS.substring(i+2);
        }
        while ((i=RS.indexOf("「 "))>=0)
        {
            RS=RS.substring(0,i)+"「"+RS.substring(i+2);
        }
         while ((i=RS.indexOf("」 "))>=0)
        {
            RS=RS.substring(0,i)+"」"+RS.substring(i+2);
        }
        RB.setText(RS);
        RB.setCaretPosition(0);
    }
    //專有名詞轉換
    private void spec_tran(String fname)
    {
        StringTokenizer stk;
        String getfr,word,code,id;
        String RS;
        int i;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("專有名詞替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
            trantmp=stok[ii];
            ntrantmp=stok[ii];
            for (i=0;i<nocnt;i=i+1)
             {
                 trantmp=snreplace(trantmp,notran[i].code,notran[i].word);
             }
             for (i=0;i<scnt;i=i+1)
            {
                    stok[ii]=ireplace(stok[ii],spec[i].code,spec[i].word);
            }
            RS=RS+stok[ii]+"\n";
        }
        RB.setText(RS);
    }
   
    //全部轉換
    private void all_tran()
    {
        String getfr,word,code,id;
        String RS;
        int i;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        //更換標點符號
        wait_lab.setText("替換標點符號！");
        wait_frame.paint(wait_frame.getGraphics());
        //RS 可能應該要分段轉換才會快 2005.05.22
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("全部替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
            trantmp=new String(stok[ii]);
            trantmp=trantmp.replace('A','a');
            trantmp=trantmp.replace('B','b');
            trantmp=trantmp.replace('C','c');
            trantmp=trantmp.replace('D','d');
            trantmp=trantmp.replace('E','e');
            trantmp=trantmp.replace('F','f');
            trantmp=trantmp.replace('G','g');
            trantmp=trantmp.replace('H','h');
            trantmp=trantmp.replace('I','i');
            trantmp=trantmp.replace('J','j');
            trantmp=trantmp.replace('K','k');
            trantmp=trantmp.replace('L','l');
            trantmp=trantmp.replace('M','m');
            trantmp=trantmp.replace('O','o');
            trantmp=trantmp.replace('P','p');
            trantmp=trantmp.replace('Q','q');
            trantmp=trantmp.replace('R','r');
            trantmp=trantmp.replace('S','s');
            trantmp=trantmp.replace('T','t');
            trantmp=trantmp.replace('U','u');
            trantmp=trantmp.replace('V','v');
            trantmp=trantmp.replace('W','w');
            trantmp=trantmp.replace('X','x');
            trantmp=trantmp.replace('Y','y');
            trantmp=trantmp.replace('Z','z');
             ntrantmp=new String(stok[ii]);
             int now_leng=999,ano_pt=0,asp_pt=0,aph_pt=0;
             if (spec[0].length>phase[0].length)
                 now_leng=spec[0].length;
             else
                 now_leng=phase[0].length;
             //System.out.println("now_leng="+now_leng);
             //aph_pt=phcnt;
             int tmpano_pt=0;
             while(ano_pt<nocnt ||asp_pt<scnt|| aph_pt<phcnt)
             {
                while ( ano_pt<nocnt && notran[ano_pt].length>=now_leng)
                {
                    trantmp=snreplace(trantmp,notran[ano_pt].code.toLowerCase(),notran[ano_pt].word);//轉小寫，比對切割
                    ntrantmp=snreplace(ntrantmp,notran[ano_pt].code.toLowerCase(),notran[ano_pt].word);//保留大小寫，比對切割
                    ano_pt++;
                }
                while (asp_pt<scnt && spec[asp_pt].length>=now_leng )
                {
                    stok[ii]=sireplace(stok[ii],spec[asp_pt].code,spec[asp_pt].word);//以ntrantmp為準轉換
                    asp_pt++;
                }

                while (aph_pt<phcnt && phase[aph_pt].length>=now_leng )
                {
                    stok[ii]=ireplace(stok[ii],phase[aph_pt].code,phase[aph_pt].word);//以trantmp為準轉換
                    aph_pt++;
                }

                now_leng--;
               // System.out.println("anow_leng="+now_leng+ "nocnt="+nocnt+" ano_pt="+ano_pt+"  asp_pt="+asp_pt+" scnt="+scnt+" aph_ot="+aph_pt+" phcnt="+phcnt+"  ");
             }
            RS=RS+stok[ii]+"\n";
        }
        RS=RS.replace(',','，');
        RS=RS.replace('.','。');
        RS=RS.replace('?','？');
        RS=RS.replace('!','！');
        RS=RS.replace(';','；');
        RS=RS.replace(':','：');
        RS=RS.replace('“','「');
        RS=RS.replace('”','」');
        wait_lab.setText("句點後轉大寫！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=fupper(RS);//句點轉大寫
        RB.setText(RS);
        RB.setCaretPosition(0);
    }
   
    //檢查到底可不可以替換 2005.05.22
    private int is_happen(String str, String inp)
    {
        int i,pt;
        i=0;
        pt=0;
        while (true)
        {
            pt=str.indexOf(inp,i);
            if (pt<=0) return pt; //表示開頭就找到了或者沒找到，直接回傳
            //表示開頭沒找到，要檢驗是不是完整的字
            //if (!Character.isLetterOrDigit(str.charAt(pt-1)))//前面不是字母或數字
            if (!Character.isUpperCase(str.charAt(pt-1))&&
                !Character.isLowerCase(str.charAt(pt-1))&&
                !Character.isDigit(str.charAt(pt-1))
                )//前面不是字母或數字
            {
                if (pt+inp.length()==str.length()) //最後一個，回傳
                    return pt;
                //if (!Character.isLetterOrDigit(str.charAt(pt+inp.length()))) //inp後面不是字母或數字啦！不處理中文
                if (!Character.isUpperCase(str.charAt(pt+inp.length()))&&
                    !Character.isLowerCase(str.charAt(pt+inp.length()))&&
                    !Character.isDigit(str.charAt(pt+inp.length()))
                     )
                    return pt;
            }
            i=pt+inp.length();
        }
    }
    //字串替換 2005.05.22 改成全部match才替換
    private String replace(String str,String inp,String out)
    {
        int i,spc;
        String ans;
        ans=str;
        //while ((i=ans.indexOf(inp))>=0)
        while ((i=is_happen(ans,inp))>=0)
        {
            //System.out.println("ssssssssssword="+inp+"||code="+out+"||"+str);
            spc=0;
            if (!Character.isUpperCase(out.charAt(out.length()-1))&&
                !Character.isLowerCase(out.charAt(out.length()-1))&&
                !Character.isDigit(out.charAt(out.length()-1))
                )
            {
                while ((i+inp.length()+spc) < ans.length() && ans.charAt(i+inp.length()+spc)==' ' ) spc=spc+1; //跳過空白
            }    
            if (!Character.isUpperCase(out.charAt(0))&&
                !Character.isLowerCase(out.charAt(0))&&
                !Character.isDigit(out.charAt(0))
                )
            {
                while (i>0 && ans.charAt(i-1)==' ') //刪掉前空白
                {
                    spc=spc+1;
                    i=i-1;
                }
            }
                
            ans=new String(ans.substring(0,i)+out+ans.substring(i+inp.length()+spc));
        }
        return ans;
    }
    //input str code=inp word=out
    private String nreplace(String str,String inp,String out)
    {
        int i,spc;
        String ans;
        ans=str;
        ans=ans.replace('A','a');
        ans=ans.replace('B','b');
        ans=ans.replace('C','c');
        ans=ans.replace('D','d');
        ans=ans.replace('E','e');
        ans=ans.replace('F','f');
        ans=ans.replace('G','g');
        ans=ans.replace('H','h');
        ans=ans.replace('I','i');
        ans=ans.replace('J','j');
        ans=ans.replace('K','k');
        ans=ans.replace('L','l');
        ans=ans.replace('M','m');
        ans=ans.replace('O','o');
        ans=ans.replace('P','p');
        ans=ans.replace('Q','q');
        ans=ans.replace('R','r');
        ans=ans.replace('S','s');
        ans=ans.replace('T','t');
        ans=ans.replace('U','u');
        ans=ans.replace('V','v');
        ans=ans.replace('W','w');
        ans=ans.replace('X','x');
        ans=ans.replace('Y','y');
        ans=ans.replace('Z','z');
        while ((i=is_happen(ans,inp))>=0)
        {
            ans=new String(ans.substring(0,i)+out+ans.substring(i+inp.length()));
           // System.out.println("nohit="+inp);
        }
        return ans;
    }
    //跟nreplace一樣，不過不更換大小寫
    private String snreplace(String str,String inp,String out)
    {
        int i,spc;
        String ans,tmp;
        ans=str;
        tmp=str.toLowerCase();
        while ((i=is_happen(tmp,inp))>=0)
        {
            tmp=new String(tmp.substring(0,i)+out+tmp.substring(i+inp.length()));
            ans=new String(ans.substring(0,i)+out+ans.substring(i+inp.length()));
        }
        return ans;
    }
     //片語轉換
    private void ph_tran(String fname,String fname1)
    {
        String getfr,word,code,id;
        String RS;
        int i;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        /********************
        if (RB.getText().length()==0)
            RS=HB.getText();
        else
            RS=RB.getText();
        ***********************/
        //更換標點符號
        wait_lab.setText("替換標點符號！");
        wait_frame.paint(wait_frame.getGraphics());
        //RS 可能應該要分段轉換才會快 2005.05.22
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("一般片語替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
             trantmp=stok[ii];
             ntrantmp=stok[ii];
             for (i=0;i<nocnt;i=i+1)
             {
                 trantmp=nreplace(trantmp,notran[i].code,notran[i].word);
             }
             //System.out.println("||trantmp="+trantmp+"||");
             for (i=0;i<phcnt;i++)
            {
                    //System.out.println(ii+"++++++word="+phase[i].word+"||code="+phase[i].code+"||");
                    stok[ii]=ireplace(stok[ii],phase[i].code,phase[i].word);
                    //RS=ireplace(RS,phase[i].code,phase[i].word);
                    //System.out.println("---word="+phase[i].word+"||code="+phase[i].code+"||");
                    //System.out.println("PH_TRAN in"+i);
            }
            RS=RS+stok[ii]+"\n";
        }
        RS=RS.replace(',','，');
        RS=RS.replace('.','。');
        RS=RS.replace('?','？');
        RS=RS.replace('!','！');
        RS=RS.replace(';','；');
        RS=RS.replace(':','：');
        RS=RS.replace('“','「');
        RS=RS.replace('”','」');
        wait_lab.setText("句點後轉大寫！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=fupper(RS);//句點轉大寫
        RB.setText(RS);
        RB.setCaretPosition(0);
    }
    //無大小寫字串替換 2005.05.22 改成全部match才替換
    private String fupper(String str)//句點後面換大寫
    {int pt,i;
     String out="";
        pt=str.indexOf('。');
        while (pt+1<str.length() && pt>=0)
        {
            if (str.charAt(pt+1)==' ' && pt+2< str.length())
            {
                out=out+str.substring(0,pt+2)+str.substring(pt+2,pt+3).toUpperCase();
                str=str.substring(pt+3);
            }
            else
            {
                out=out+str.substring(0,pt+1)+str.substring(pt+1,pt+2).toUpperCase();
                str=str.substring(pt+2);
            }
             pt=str.indexOf('。');
        }
        out=out+str;
        return out;
    }
    //input:str code=羅馬字 out=漢字 tmp=暫存區
    private String ireplace(String str,String inp,String out) //片語用
    {
        int i,spc;
        String ans;
        ans=str;
        while ((i=is_happen(trantmp,inp))>=0)
        {
            spc=0;
            if (!Character.isUpperCase(out.charAt(out.length()-1))&&
                !Character.isLowerCase(out.charAt(out.length()-1))&&
                !Character.isDigit(out.charAt(out.length()-1))
                )
            {
                while ( (i+inp.length()+spc) < ans.length() && ans.charAt(i+inp.length()+spc)==' ' ) spc=spc+1; //跳過空白
            }
            if (!Character.isUpperCase(out.charAt(0))&&
                !Character.isLowerCase(out.charAt(0))&&
                !Character.isDigit(out.charAt(0))
                )
            {
                //System.out.println("i="+i+" ans="+ans);
                 //System.out.println("i="+i+" tmp="+trantmp);
                while (i>0 && ans.charAt(i-1)==' ') //刪掉前空白
                {
                    spc=spc+1;
                    i=i-1;
                }
            }
            //System.out.println("inp="+inp+" out="+out);
            //perserve UpperCase
            if (Character.isUpperCase(ans.charAt(i)))
                ans=ans.substring(0,i)+out.substring(0,1).toUpperCase()+out.substring(1)+ans.substring(i+inp.length()+spc);
            else
                ans=ans.substring(0,i)+out+ans.substring(i+inp.length()+spc);
           // System.out.println("q="+trantmp+"inp="+inp);
           // System.out.println("nq="+ntrantmp+"inp="+inp);
            trantmp=trantmp.substring(0,i)+EPAD.substring(0,out.length())+trantmp.substring(i+inp.length()+spc);
            ntrantmp=ntrantmp.substring(0,i)+EPAD.substring(0,out.length())+ntrantmp.substring(i+inp.length()+spc);
           // System.out.println("t="+trantmp+"inp="+inp);
           // System.out.println("nt="+ntrantmp+"inp="+inp);

        }
        return ans;
    }
    private String sireplace(String str,String inp,String out) //專有名詞用
    {
        int i,spc;
        String ans;
        //ans=str.toLowerCase();//大寫的N
        ans=str;
        //while ((i=tmp.indexOf(inp))>=0)
        while ((i=is_happen(ntrantmp,inp))>=0)
        {
            spc=0;
            if (!Character.isUpperCase(out.charAt(out.length()-1))&&
                !Character.isLowerCase(out.charAt(out.length()-1))&&
                !Character.isDigit(out.charAt(out.length()-1))
                )
            {
                while ( (i+inp.length()+spc) < ans.length() && ans.charAt(i+inp.length()+spc)==' ' ) spc=spc+1; //跳過空白
            }
            if (!Character.isUpperCase(out.charAt(0))&&
                !Character.isLowerCase(out.charAt(0))&&
                !Character.isDigit(out.charAt(0))
                )
            {
                //System.out.println("i="+i+" ans="+ans);
                 //System.out.println("i="+i+" tmp="+trantmp);
                while (i>0 && ans.charAt(i-1)==' ') //刪掉前空白
                {
                    spc=spc+1;
                    i=i-1;
                }
            }
            //System.out.println("inp="+inp+" out="+out);
            //perserve UpperCase
            if (Character.isUpperCase(ans.charAt(i)))
                ans=ans.substring(0,i)+out.substring(0,1).toUpperCase()+out.substring(1)+ans.substring(i+inp.length()+spc);
            else
                ans=ans.substring(0,i)+out+ans.substring(i+inp.length()+spc);
            // System.out.println("q="+trantmp+"inp="+inp);
           // System.out.println("nq="+ntrantmp+"inp="+inp);
            trantmp=trantmp.substring(0,i)+EPAD.substring(0,out.length())+trantmp.substring(i+inp.length()+spc);
            ntrantmp=ntrantmp.substring(0,i)+EPAD.substring(0,out.length())+ntrantmp.substring(i+inp.length()+spc);
           // System.out.println("t="+trantmp+"inp="+inp);
            //System.out.println("nt="+ntrantmp+"inp="+inp);
        }
        return ans;
    }
    //20090129轉全部
    private void ball_tran()
    {
        StringTokenizer stk;
        String getfr,word,code,id;
        String RS,ptmp;
        int i,is,ip,pt;
        int wordcnt;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        wait_lab.setText("替換標點符號！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=RS.replace("，",", ");
        RS=RS.replace("。",". ");
        RS=RS.replace("？","? ");
        RS=RS.replace("！","! ");
        RS=RS.replace("；","; ");
        RS=RS.replace("：",", ");
        RS=RS.replace('「','"');
        RS=RS.replace('」','"');
        RS=RS.replace("、",", ");
        String[] stok = RS.split("\n");
        RS="";
         for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("專有名詞替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
            trantmp=stok[ii];
            if (spec[0].word.length()>phase[0].word.length())
                wordcnt=spec[0].word.length();
            else
                wordcnt=phase[0].word.length();
            is=0;ip=0;
            while (wordcnt>0)
            {
                while (is<scnt && spec[is].word.length()>=wordcnt)
                {
                    stok[ii]=breplace(stok[ii],spec[is].word,spec[is].code);
                    is++;
                }
                 while (ip<phcnt && phase[ip].word.length()>=wordcnt)
                 {
                     stok[ii]=breplace(stok[ii],phase[ip].word,phase[ip].code);
                     ip++;
                 }
                 //System.out.println(wordcnt+"  "+is+"  ip"+ip+"  "+stok[ii]);
                 wordcnt--;
            }//while wordcnt;
             pt=0;
                while (pt+1<stok[ii].length() && stok[ii].charAt(pt)==' ') pt=pt+1;
                if (pt+1<stok[ii].length())
                {
                    stok[ii]=stok[ii].substring(0,pt)+stok[ii].substring(pt,pt+1).toUpperCase()
                         +stok[ii].substring(pt+1);
                }
            RS=RS+stok[ii]+"\n";
        }//for ii
        //最後處理
        wait_lab.setText("清除無用空白！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=RS.replace(" {2,}"," ");
        RS=RS.replace(" .",".");
        RS=RS.replace(" ,",",");
        RS=RS.replace(" -","-");
        RS=RS.replace(" ;",";");
        RS=RS.replace(" ?","?");
        RS=RS.replace(" !","!");
        RS=RS.replace("\" ","\"");
        RS=RS.replace(" \"","\"");
        
        ptmp="";
        while ((pt=RS.indexOf("."))>=0)
        {
            while (pt+1<RS.length() && RS.charAt(pt+1)==' ') pt=pt+1;
                if (pt+1<RS.length())
                {
                    ptmp=ptmp+RS.substring(0,pt+1)+RS.substring(pt+1,pt+2).toUpperCase();
                    RS=RS.substring(pt+2);
                }
        }
        ptmp=ptmp+RS;
        RB.setText(ptmp);
    }
    //專有名詞由漢字轉全羅
    private void bspec_tran()
    {
        StringTokenizer stk;
        String getfr,word,code,id;
        String RS;
        int i;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("專有名詞替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
            trantmp=stok[ii];
            //System.out.println(ii+"===>"+stok[ii]);
             for (i=0;i<scnt;i=i+1)
            {
                    //System.out.println("ssssssssssword="+s_word[i]+"||code="+s_code[i]+"||");
                    //RS=replace(RS,spec[i].code,spec[i].word);
                    stok[ii]=breplace(stok[ii],spec[i].word,spec[i].code);
            }
            RS=RS+stok[ii]+"\n";
        }
        RB.setText(RS);
    }
    private void bph_tran()
    {
        StringTokenizer stk;
        String getfr,word,code,mid;
        String RS,ptmp;
        int i,pt;
        if (BUF.length()==0)
            RS=HB.getText();
        else RS=BUF;
        wait_lab.setText("替換標點符號！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=RS.replace("，",", ");
        RS=RS.replace("。",". ");
        RS=RS.replace("？","? ");
        RS=RS.replace("！","! ");
        RS=RS.replace("；","; ");
        RS=RS.replace("：",", ");
        RS=RS.replace('「','"');
        RS=RS.replace('」','"');
        RS=RS.replace("、",", ");
     
        String[] stok = RS.split("\n");
        RS="";
        //System.out.println("stok"+stok.length);
        for (int ii=0;ii<stok.length;ii++)
        {
            wait_lab.setText("一般片語替換，進度 "+ii+"/"+stok.length);
            wait_frame.paint(wait_frame.getGraphics());
            //System.out.println(ii+"===>"+stok[ii]);
            trantmp=stok[ii];
             for (i=0;i<phcnt;i=i+1)
            {
                   //System.out.println(i+"word="+phase[i].word+"||code="+phase[i].code+"||");
                    //RS=replace(RS,spec[i].code,spec[i].word);
                    //System.out.println("s="+i+" phcnt="+phcnt);
                    stok[ii]=breplace(stok[ii],phase[i].word,phase[i].code);
                   
            }
            //處理大寫啦！
                pt=0;
                while (pt+1<stok[ii].length() && stok[ii].charAt(pt)==' ') pt=pt+1;
                if (pt+1<stok[ii].length())
                {
                    stok[ii]=stok[ii].substring(0,pt)+stok[ii].substring(pt,pt+1).toUpperCase()
                         +stok[ii].substring(pt+1);
                }
            RS=RS+stok[ii]+"\n";
        }
        //最後處理
        wait_lab.setText("清除無用空白！");
        wait_frame.paint(wait_frame.getGraphics());
        RS=RS.replace(" {2,}"," ");
        RS=RS.replace(" .",".");
        RS=RS.replace(" ,",",");
        RS=RS.replace(" -","-");
        RS=RS.replace(" ;",";");
        RS=RS.replace(" ?","?");
        RS=RS.replace(" !","!");
        RS=RS.replace("\" ","\"");
        RS=RS.replace(" \"","\"");
        
        ptmp="";
        while ((pt=RS.indexOf("."))>=0)
        {
            while (pt+1<RS.length() && RS.charAt(pt+1)==' ') pt=pt+1;
                if (pt+1<RS.length())
                {
                    ptmp=ptmp+RS.substring(0,pt+1)+RS.substring(pt+1,pt+2).toUpperCase();
                    RS=RS.substring(pt+2);
                }
        }
        ptmp=ptmp+RS;
        RB.setText(ptmp);
    }
    private String breplace(String str,String inp,String out)
    {
        int i,spc,mid;
        String ans,pword;
        ans=str;
        pword="";
        for (mid=0;mid<out.length();mid++)
                    pword=pword+"=";
        while ((i=trantmp.indexOf(inp))>=0)
        {
            if (i==0)//開頭
            {
                ans=ans.substring(0,i)+out+" "+ans.substring(i+inp.length());
                trantmp=trantmp.substring(0,i)+pword+" "+trantmp.substring(i+inp.length());
            }
            else //段落中間
            {
                ans=ans.substring(0,i)+" "+out+" "+ans.substring(i+inp.length());
                trantmp=trantmp.substring(0,i)+" "+pword+" "+trantmp.substring(i+inp.length());
            }
        
        }
        return ans;
    }

    //滑鼠事件處理類別寫在這裡
  /***主程式***/
    public static void main(String args[]) //程式起點
    {
        if (args.length>0)
        {
            to_han=Integer.parseInt(args[0]);
        }
        lh app=new lh(); //名稱改一改，啟動UI元件
         f = new JFrame("漢羅轉換程式 4.2 unicode 版");
        // To close the application:
        f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        f.getContentPane().add(app);//把Applet 加進去
        f.setSize(700,640);
        applet=0;
        app.init();//呼叫init()
        app.start();//呼叫start()
        f.setVisible(true);
    }
}
