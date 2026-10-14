/*****************************************
merge.java 華台merge
一般片語檔 ht_phrase.txt
不應轉換檔 ht_notran.txt
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
    //String length;
    String code;
    String word;
}
public class merge extends JApplet implements ActionListener //名稱改一改
{
    Container c;
    static int to_han=0;//1轉漢羅 0轉全羅
    //設定UI元件
    JTextArea RB,HB;
    JLabel RBt,HBt,hpht,rpht,sfilet,lab,lab1,lab2,lab3,lab4;
    JButton bot0,bot1,bot2,bot3,bot4,bot5,bot6,bot7;
    JTextField hph,rph;
    String sfile;
    JScrollPane jscpr,jscph;
    JPanel jp1,jp2,jp3,jp4;
    String BUF;
    String phrase_name,spec_name,notran_name;
    lookup_table spec[];
    lookup_table phase[];
    lookup_table notran[];
    JCheckBox ck1;
    int maxscnt=10000;//最多一萬個專有名詞
    int maxnocnt=1000;//最多一千個強迫不轉
    int maxphcnt=60000;//最多6萬個片語
    static int applet=1;
    String trantmp;
    int phcnt,scnt,nocnt;
    int equ;
    //設定共用的變數與類別
    public void init()   //建構元，名稱改一改
    {
        c=getContentPane();//取得ContentPane
	//設定版面設定
            phrase_name="ht_phrase.txt";
            notran_name="ht_notran.txt";

        c.setLayout(new BoxLayout(c,BoxLayout.Y_AXIS));
	//初始化UI元件
        equ=0;
        jp1=new JPanel();
        jp2=new JPanel();
        jp3=new JPanel();
        jp4=new JPanel();
        jp1.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp2.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp3.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        jp4.setLayout(new FlowLayout(FlowLayout.CENTER));//設定為用flowlayout
        //RBt=new JLabel("漢字");
        //HBt=new JLabel("羅馬字");
        //hpht=new JLabel("漢字片語");
        //rpht=new JLabel("羅馬字");
        lab=new JLabel("華台模式");
        lab1=new JLabel("");
        lab2=new JLabel("");
        lab3=new JLabel("");
        lab4=new JLabel("");
        lab.setFont(new Font("Serif",Font.PLAIN,20));
        sfilet=new JLabel("        ");
        bot7=new JButton("選擇要加入的檔案");
        hph=new JTextField(12);
        rph=new JTextField(15);
        //sfile=new JTextField(15);
        RB=new JTextArea(18,50);
        //RB.setFont(new Font("細明體",Font.PLAIN,14));
        RB.setDefaultLocale(Locale.TRADITIONAL_CHINESE );
        //RB.setDefaultLocale(Locale.TAIWAN );
        RB.setLineWrap(true);
        BUF=new String("");
        jscpr=new JScrollPane(RB);
        HB=new JTextArea(8,50);
        HB.setLineWrap(true);
        jscph=new JScrollPane(HB);
        if (applet==0)
            bot0=new JButton("結束");
        else
            bot0=new JButton("清除");
        bot1=new JButton("片語檔排序");
        ck1=new JCheckBox("只做分析");
        bot4=new JButton("合併片語");
	//將UI元件加入ContentPane
        //jp1.add(hpht);
       // jp1.add(hph);
        //jp1.add(rpht);
        //jp1.add(rph);
        jp1.add(lab);
        jp1.add(bot7);
        jp1.add(sfilet);
        jp1.add(bot4);;
        jp1.add(lab1);
        jp1.add(lab2);
        jp1.add(lab3);
        jp1.add(lab4);
        //jp2.add(HBt);
        //jp2.add(jscph);
        //jp3.add(RBt);
        //jp3.add(jscpr);
        jp4.add(ck1);
        if (applet==0)
        {
            
            jp4.add(bot1);
        }
       // jp4.add(bot3);
        jp4.add(bot0);
        if (applet==0)
            c.add(jp1);
        c.add(jp4);
        bot0.addActionListener(this);
        bot1.addActionListener(this);
        //bot3.addActionListener(this);
        bot4.addActionListener(this);
        bot7.addActionListener(this);
        spec=new lookup_table[maxscnt];
        phase=new lookup_table[maxphcnt];
        notran=new lookup_table[maxnocnt];
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
                fr= new BufferedReader(new FileReader(fname));
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream()));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                //getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token
                id=stk.nextToken();
                word=stk.nextToken();
                spec[scnt]=new lookup_table();
                //s_word[scnt]=word;
                spec[scnt].word=word;
                code=getfr.substring(id.length()+word.length()+2);
                code=code.trim();
                //s_code[scnt]=code;
                spec[scnt].code=code;
                scnt=scnt+1;
                if (scnt>=maxscnt)
                    System.out.println("太多專有名詞了，請改 maxscnt");
                //System.out.println("word="+word+"||code="+code+"||");
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
            System.out.println("fname="+fname+"開啟error!"+e.toString());
            HB.setText("fname="+fname+"開啟error!");
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
                fr= new BufferedReader(new FileReader(fname));
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream()));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                //getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token
                id=stk.nextToken();
                word=stk.nextToken();
                phase[phcnt]=new lookup_table();
                phase[phcnt].word=word;
                //ph_word[phcnt]=word;
                code=getfr.substring(id.length()+word.length()+2);
                code=code.trim();
                //ph_code[phcnt]=code;
                phase[phcnt].code=code;
                phcnt=phcnt+1;
                if (phcnt>=maxphcnt)
                    System.out.println("太多片語了，請改 maxphcnt");
                //System.out.println("word="+word+"||code="+code+"||");
            }//while fr.ready()
            fr.close(); //close file
        }
        catch(Exception e){
            System.out.println(e.toString()+"fname="+fname+"開啟error!，在第"+phcnt+"行附近出問題");
            HB.setText(e.toString()+"fname="+fname+"開啟error!，在第"+phcnt+"行附近出問題");
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
                fr= new BufferedReader(new FileReader(fname));
            else
            {
                URL ud1=new URL(getDocumentBase(),fname);
                fr = new BufferedReader(new InputStreamReader(ud1.openStream()));
            }
            while ((getfr = fr.readLine())!=null)//如果檔案沒有讀完，就繼續處理
            {
                code=getfr.trim();
                word="";
                for (id=0;id<code.length();id++)
                    word=word+"=";
                notran[nocnt]=new lookup_table();
                notran[nocnt].word=word;
                notran[nocnt].code=code;
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
            HB.setText("");
            RB.setText("");
            if (applet==0)
                System.exit(0);
        }
        else if (e.getSource()==bot7) //尋找檔案
        {
            JFileChooser jfc = new JFileChooser("./");
            int	rst = jfc.showOpenDialog(this);
		  if(rst==JFileChooser.APPROVE_OPTION){
		  	sfile=jfc.getSelectedFile().toString();
            sfilet.setText("選定檔案："+sfile);
		  }
        }
        else if (e.getSource()==bot1) //片語轉換
        {
            //spec_tran("SPEC");
              ph_read(phrase_name);
              cp_ph(phrase_name,phase);
        }
        
        else if (e.getSource()==bot4) //加入片語
        {
            ph_read(phrase_name);
            try{
                BufferedReader frn= new BufferedReader(new FileReader(sfile));
                StringTokenizer stk;
                String getfr,now_word,now_code,now_id;
                int id,cnt;
                int ccnt[]=new int[4];
                ccnt[0]=0;ccnt[1]=0;ccnt[2]=0;ccnt[3]=0;
                 while (frn.ready())//如果檔案沒有讀完，就繼續處理
                 {
                     getfr = frn.readLine(); //取得一行輸入
                     stk=new StringTokenizer(getfr," \n\t"); //取得token
                     now_id=stk.nextToken();
                     id=Integer.parseInt(now_id);
                     now_word=stk.nextToken();
                     now_code=getfr.substring(now_id.length()+now_word.length()+2);
                     now_code=now_code.trim();
                     now_word=now_word.trim();
                     hph.setText(now_word);
                     rph.setText(now_code);
                     add_tran2(phrase_name,1);
                     ccnt[equ]++;
                 }
                 frn.close();
                 lab1.setText("完全相同："+ccnt[0]+"個詞");
                 lab2.setText("羅馬字不一樣："+ccnt[1]+"個詞");
                 lab3.setText("漢字不一樣："+ccnt[2]+"個詞");
                 lab4.setText("完全不同："+ccnt[3]+"個詞");
                 if (ck1.isSelected())
                     JOptionPane.showMessageDialog(null,"分析完成！"); 
                 else
                     JOptionPane.showMessageDialog(null,"加入完成！"); 
            }
             catch(Exception e1){
                 System.out.println(e1.toString()+"phase.hr 改寫error!");
             };
            ph_read(phrase_name);
        }
        
    }
    //轉換片語或專有名詞進入記憶體中
    private void cp_ph(String fname,lookup_table lookup[])
    {
        DecimalFormat df = new DecimalFormat("000");//設定格式
        StringTokenizer stk;
        int id,flag,flag1;
        int i,cnt=0;
        byte[] len;
        Comparator<lookup_table> scc=new cc<lookup_table>();
        File f1=new File(fname+".bak");
        File f2=new File(fname);
        f2.renameTo(f1);
        //sort
        Arrays.sort(lookup,0,scnt,scc);
        try
        {
            BufferedWriter fp= new BufferedWriter(new FileWriter(fname));
	    //看看輸入什麼檔案，就用哪一個計數器
	    if (fname.equals(phrase_name))
		    cnt=phcnt;
	    else  if (fname.equals(spec_name))
		    cnt=scnt;
            for (i=0;i<cnt;i=i+1)
            {
                    //RS=replace(RS,s_code[i],s_word[i]);
                    len=lookup[i].code.getBytes();
                    fp.write(df.format(len.length)+" "+lookup[i].word+" "+lookup[i].code);
                    fp.newLine();
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
    private void add_tran2(String fname,int mode) throws IOException
    {//mode=0 保持大小寫，mode=1 轉換成小寫
        DecimalFormat df = new DecimalFormat("000");//設定格式
        StringTokenizer stk;
        String word,code,getfr,now_word,now_code,now_id;
        int id,flag,flag1,i;
        word=hph.getText().trim();
        code=rph.getText().trim();
        //先檢查有沒有重複好了，省時間
        flag=0;
        equ=0;
        if (mode==1)//片語檔案
        {
            for (i=0;i<phcnt;i++)
                {
                    if (phase[i].code.equals(code) && phase[i].word.equals(word))//完全一樣
                    {
                        //System.out.println(equ);
                        return;
                        
                    }
                    else if (!phase[i].code.equals(code) && phase[i].word.equals(word))//羅馬字不一樣
                    {
                        equ=1;
                        return;
                    }
                    else if (phase[i].code.equals(code) && !phase[i].word.equals(word))//漢字不一樣
                    {
                        equ=2;
                        return;
                    }
                }
                 equ=3;//完全不一樣
        }
        else if (mode==0)
        {
            for (i=0;i<scnt;i++)
                {
                    if (spec[i].code.equals(code) && spec[i].word.equals(word))//完全一樣
                        return;
                    else if (!spec[i].code.equals(code) && spec[i].word.equals(word))//羅馬字不一樣
                    {
                        equ=1;
                        return;
                    }
                    else if (spec[i].code.equals(code) && !spec[i].word.equals(word))//漢字不一樣
                    {
                        equ=2;
                        return;
                    }
                }
                equ=3;//完全不一樣
        }
        if (ck1.isSelected()) return;
        //System.out.println(word+"   "+code);
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
        if (word.equals(code)) return;//word 換成 code一樣會出事
        byte[] len=code.getBytes();
        File f1=new File(fname+".bak");
        f1.delete();
        File f2=new File(fname);
        f2.renameTo(f1);
        
            BufferedWriter fp= new BufferedWriter(new FileWriter(fname));
            BufferedReader fr= new BufferedReader(new FileReader(f1));
            flag=0; //新的有沒有寫入
            while (fr.ready())//如果檔案沒有讀完，就繼續處理
            {
                flag1=1; //舊的要不要再寫入 1表示要再寫入 0表示不用了
                getfr = fr.readLine(); //取得一行輸入
                stk=new StringTokenizer(getfr," \n\t"); //取得token
                now_id=stk.nextToken();
                id=Integer.parseInt(now_id);
                now_word=stk.nextToken();
                now_code=getfr.substring(now_id.length()+now_word.length()+2);
                now_code=now_code.trim();
                now_word=now_word.trim();
                //System.out.println(word+"|   |"+code+ "|   |"+now_code+"|    |"+now_word);
                //判斷重複
                if (now_code.equals(code) && now_word.equals(word))//完全一樣
                {
                     flag=1;
                     //System.out.println("完全一樣"+word+"   "+code);
                }
                else if (!now_code.equals(code) && now_word.equals(word))//漢字一樣，羅馬字不一樣
                {
                    //System.out.println(word+"   "+code+ "   "+now_code+"    "+now_word); 
                    String message="原有 ["+now_code+"  "+now_word+"] 新的 ("+code+"  "+word+
                                    ") 華語重複，是否覆蓋？";
                     int messageType=JOptionPane.QUESTION_MESSAGE;
                     int optionType=	JOptionPane.YES_NO_OPTION ;
                     String[] option={"覆蓋","不覆蓋"};
                     JOptionPane op=new JOptionPane();
                     int YN=op.showOptionDialog(this,message,
                     "華語重複",optionType,messageType,null,option,
                     option[0]);
                     if (YN==JOptionPane.YES_OPTION)
                         flag1=0;
                     else flag=1;
                }
                else if (now_code.equals(code) && !now_word.equals(word))//羅馬字一樣，羅馬字一樣
                {
                    //System.out.println(word+"   "+code+ "   "+now_code+"    "+now_word+"===="); 
                     String message="原有 ["+now_code+"  "+now_word+"] 新的 ("+code+"  "+word+
                                    ") 台語重複，是否增加？";
                     int messageType=JOptionPane.QUESTION_MESSAGE;
                     int optionType=	JOptionPane.YES_NO_OPTION ;
                     String[] option={"增加","不增加"};
                     JOptionPane op1=new JOptionPane();
                     int YN1=op1.showOptionDialog(this,message,
                     "台語重複",optionType,messageType,null,option,
                     option[0]);
                     if (YN1==JOptionPane.YES_OPTION)
                         flag=0;
                     else flag=1;
                }
                if (len.length>id && flag==0)
                {
                    fp.write(df.format(len.length)+" "+word+" "+code);
                    fp.newLine();
                    flag=1;
                }
                if (flag1==1)
                {
                    fp.write(getfr.trim());
                    fp.newLine();
                }
                else flag1=1;
                
            }//while fr.ready()
            if (flag==0)//沒換到
            {
                fp.write(df.format(len.length)+" "+word+" "+code);
                fp.newLine();
            }
            fr.close(); //close file
            fp.close(); //close file
        hph.setText("");
        rph.setText("");
        f1.delete();//砍掉bak
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
        /*****************
        if (RB.getText().length()==0)
            RS=HB.getText();
        else
            RS=RB.getText();
        ******************/
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
             for (i=0;i<scnt;i=i+1)
            {
                    //System.out.println("ssssssssssword="+s_word[i]+"||code="+s_code[i]+"||");
                    //RS=replace(RS,spec[i].code,spec[i].word);
                    stok[ii]=replace(stok[ii],spec[i].code,spec[i].word);
            }
            RS=RS+stok[ii]+"\n";
        }
        RB.setText(RS);
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
        
        while ((i=RS.indexOf(","))>=0)
        {
            RS=RS.substring(0,i)+"，"+RS.substring(i+1);
        }
        while ((i=RS.indexOf("."))>=0)
        {
            RS=RS.substring(0,i)+"。"+RS.substring(i+1);
        }
        while ((i=RS.indexOf("?"))>=0)
        {
            RS=RS.substring(0,i)+"？"+RS.substring(i+1);
        }
        while ((i=RS.indexOf("!"))>=0)
        {
            RS=RS.substring(0,i)+"！"+RS.substring(i+1);
        }
        while ((i=RS.indexOf(";"))>=0)
        {
            RS=RS.substring(0,i)+"；"+RS.substring(i+1);
        }
        while ((i=RS.indexOf(":"))>=0)
        {
            RS=RS.substring(0,i)+"："+RS.substring(i+1);
        }
        while ((i=RS.indexOf("“"))>=0)
        {
            RS=RS.substring(0,i)+"「"+RS.substring(i+1);
        }
         while ((i=RS.indexOf("”"))>=0)
        {
            RS=RS.substring(0,i)+"」"+RS.substring(i+1);
        }
        
        //RS 可能應該要分段轉換才會快 2005.05.22
        String[] stok = RS.split("\n");
        RS="";
        for (int ii=0;ii<stok.length;ii++)
        {
             trantmp=stok[ii];
             for (i=0;i<nocnt;i=i+1)
             {
                 trantmp=nreplace(trantmp,notran[i].code,notran[i].word);
             }
             for (i=0;i<phcnt;i++)
            {
                    //System.out.println("++++++word="+phase[i].word+"||code="+phase[i].code+"||");
                    stok[ii]=ireplace(stok[ii],phase[i].code,phase[i].word);
                    //RS=ireplace(RS,phase[i].code,phase[i].word);
                    //System.out.println("---word="+phase[i].word+"||code="+phase[i].code+"||");
                    //System.out.println("PH_TRAN in"+i);
            }
            RS=RS+stok[ii]+"\n";
        }
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
        }
        return ans;
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
    //無大小寫字串替換 2005.05.22 改成全部match才替換
    //input:str code=羅馬字 out=漢字 tmp=暫存區
    private String ireplace(String str,String inp,String out)
    {
        int i,spc;
        String ans;
        //ans=str.toLowerCase();//大寫的N
        ans=str;
        //while ((i=tmp.indexOf(inp))>=0)
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
            ans=ans.substring(0,i)+out+ans.substring(i+inp.length()+spc);
            trantmp=trantmp.substring(0,i)+out+trantmp.substring(i+inp.length()+spc);
        }
        return ans;
    }
    //滑鼠事件處理類別寫在這裡
  /***主程式***/
    public static void main(String args[]) //程式起點
    {
        
        merge app=new merge(); //名稱改一改，啟動UI元件
        JFrame f = new JFrame("漢羅片語合併程式");
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
