<?php
$mon=array('N','nn','ii','ou','a','i','u','e','o','OU','Ii','II','Ou','A','I','U','E','O');//母音
$son=array('chh','ch','kh','th','ph','p','t','k','b','g','l',
           'j','h','s','n','f','v','y');
	//'f','v','y' 客語用，嚴格檢查拿掉
 $mson=array('ng','m','n','NG','M','Ng','N');//母子音共用
 $tail=array('t','p','k','h');//入聲字尾
 $sound=array('2','3','5','7','8','9');//調號
 $word=array('','','',0);
 //響度表
 $tmon_weight=array(
   'a'=> 10,
   'A'=> 10,
   'ou'=>8,
   'Ou'=>8,
   'OU'=>8,
   'E'=>6,
   'e' => 6,
   'O'=>4,
   'o' =>4,
   'i' =>3,
   'I'=>3,
   'u'=>2,
   'U'=>2
 );
 $mon_weight=array(
   'a'=> 10,
   'A'=> 10,
   'ou'=>8,
   'Ou'=>8,
   'OU'=>8,
   'E'=>6,
   'e' => 6,
   'O'=>4,
   'o' =>4,
   'i' =>2,
   'I'=>2,
   'u'=>3,
   'U'=>3
 );
 //unicode 替換表

 $map_tailo = array(
    'A2' => 'Á',
    'A3' => 'À',
    'A5' => 'Â',
    'A7' => 'Ā',
    'A8' => 'A̍',

    'a2' => 'á',
    'a3' => 'à',
    'a5' => 'â',
    'a7' => 'ā',
    'a8' => 'a̍',

    'OO2' => 'ÓO',
    'OO3' => 'ÒO',
    'OO5' => 'ÔO',
    'OO7' => 'ŌO',
    'OO8' => 'O̍O',

    'oo2' => 'óo',
    'oo3' => 'òo',
    'oo5' => 'ôo',
    'oo7' => 'ōo',
    'oo8' => 'o̍o',

    'E2' => 'É',
    'E3' => 'È',
    'E5' => 'Ê',
    'E7' => 'Ē',
    'E8' => 'E̍',

    'e2' => 'é',
    'e3' => 'è',
    'e5' => 'ê',
    'e7' => 'ē',
    'e8' => 'e̍',

    'O2' => 'Ó',
    'O3' => 'Ò',
    'O5' => 'Ô',
    'O7' => 'Ō',
    'O8' => 'O̍',

    'o2' => 'ó',
    'o3' => 'ò',
    'o5' => 'ô',
    'o7' => 'ō',
    'o8' => 'o̍',

    'I2' => 'Í',
    'I3' => 'Ì',
    'I5' => 'Î',
    'I7' => 'Ī',
    'I8' => 'I̍',

    'i2' => 'í',
    'i3' => 'ì',
    'i5' => 'î',
    'i7' => 'ī',
    'i8' => 'i̍',
    //'i8' => chr(1).chr(0x31).'̍',
    'M2' => 'Ḿ',
    'M3' => 'M̀',
    'M5' => 'M̂',
    'M7' => 'M̄',
    'M8' => 'M̍',

    'm2' => 'ḿ',
    'm3' => 'm̀',
    'm5' => 'm̂',
    'm7' => 'm̄',
    'm8' => 'm̍',

    'N2' => 'Ń',
    'N3' => 'Ǹ',
    'N5' => 'N̂',
    'N7' => 'N̄',
    'N8' => 'N̍',

    'n2' => 'ń',
    'n3' => 'ǹ',
    'n5' => 'n̂',
    'n7' => 'n̄',
    'n8' => 'n̍',

    'U2' => 'Ú',
    'U3' => 'Ù',
    'U5' => 'Û',
    'U7' => 'Ū',
    'U8' => 'U̍',

    'u2' => 'ú',
    'u3' => 'ù',
    'u5' => 'û',
    'u7' => 'ū',
    'u8' => 'u̍',


'a9' =>'ă',
'i9' =>'ĭ',
'u9' =>'ŭ',
'e9' => 'ĕ',
'o9' => 'ŏ',
'oo9'=>'ŏ͘',
'm9'=>'m̆ ',
'n9'=>'n̆g',
'A9'=>'Ă', 
'I9'=>'Ĭ', 
'U9'=>'Ŭ', 
'E9'=>'Ĕ', 
'O9'=>'Ŏ', 
'OO9'=>'Ŏ͘',  
'M9'=>'M̆ ', 
'N9'=>'N̆g',  
/****************************************/

    'II0' => 'Ṳ',    // required
    'II2' => 'Ṳ́',
    'II3' => 'Ṳ̀',
    'II4' => 'Ṳ',    // required
    'II5' => 'Ṳ̂',
    'II7' => 'Ṳ̄',	//not used
    'II8' => '̍Ṳ̍',

    'ii0' => 'ṳ',    // required
    'ii2' => 'ṳ́',
    'ii3' => 'ṳ̀',
    'ii4' => 'ṳ',    // required
    'ii5' => 'ṳ̂',
    'ii7' => 'ṳ̄',	//not used
    'ii8' => 'ṳ̍'
/******************************************/
);
 $map_utf8 = array(
    'A2' => 'Á',
    'A3' => 'À',
    'A5' => 'Â',
    'A7' => 'Ā',
    'A8' => 'A̍',

    'a2' => 'á',
    'a3' => 'à',
    'a5' => 'â',
    'a7' => 'ā',
    'a8' => 'a̍',

    'E2' => 'É',
    'E3' => 'È',
    'E5' => 'Ê',
    'E7' => 'Ē',
    'E8' => 'E̍',

    'e2' => 'é',
    'e3' => 'è',
    'e5' => 'ê',
    'e7' => 'ē',
    'e8' => 'e̍',

    'I2' => 'Í',
    'I3' => 'Ì',
    'I5' => 'Î',
    'I7' => 'Ī',
    'I8' => 'I̍',

    'i2' => 'í',
    'i3' => 'ì',
    'i5' => 'î',
    'i7' => 'ī',
    'i8' => 'i̍',
    //'i8' => chr(1).chr(0x31).'̍',
    'M2' => 'Ḿ',
    'M3' => 'M̀',
    'M5' => 'M̂',
    'M7' => 'M̄',
    'M8' => 'M̍',

    'm2' => 'ḿ',
    'm3' => 'm̀',
    'm5' => 'm̂',
    'm7' => 'm̄',
    'm8' => 'm̍',

    'nn' => 'ⁿ',

    'N2' => 'Ń',
    'N3' => 'Ǹ',
    'N5' => 'N̂',
    'N7' => 'N̄',
    'N8' => 'N̍',

    'n2' => 'ń',
    'n3' => 'ǹ',
    'n5' => 'n̂',
    'n7' => 'n̄',
    'n8' => 'n̍',

    'O2' => 'Ó',
    'O3' => 'Ò',
    'O5' => 'Ô',
    'O7' => 'Ō',
    'O8' => 'O̍',

    'o2' => 'ó',
    'o3' => 'ò',
    'o5' => 'ô',
    'o7' => 'ō',
    'o8' => 'o̍',

    'OU0' => 'O͘',    // required
    'OU2' => 'Ò͘', //test
    'OU3' => 'Ó͘',
    'OU4' => 'O͘',    // required
    'OU5' => 'Ô͘',
    'OU7' => 'Ō͘',
    'OU8' => 'O̍͘',

    'Ou0' => 'O͘',    // required
    'Ou2' => 'Ò͘', //test
    'Ou3' => 'Ó͘',
    'Ou4' => 'O͘',    // required
    'Ou5' => 'Ô͘',
    'Ou7' => 'Ō͘',
    'Ou8' => 'O̍͘',

    'ou0' => 'o͘',    // required
    'ou2' => 'ó͘',
    'ou3' => 'ò͘',
    'ou4' => 'o͘',    // required
    'ou5' => 'ô͘',
    'ou7' => 'ō͘',
    'ou8' => 'o̍͘',

    'U2' => 'Ú',
    'U3' => 'Ù',
    'U5' => 'Û',
    'U7' => 'Ū',
    'U8' => 'U̍',

    'u2' => 'ú',
    'u3' => 'ù',
    'u5' => 'û',
    'u7' => 'ū',
    'u8' => 'u̍',


'a9' =>'ă',
'i9' =>'ĭ',
'u9' =>'ŭ',
'e9' => 'ĕ',
'o9' => 'ŏ',
'oo9'=>'ŏ͘',
'm9'=>'m̆ ',
'n9'=>'n̆g',
'A9'=>'Ă', 
'I9'=>'Ĭ', 
'U9'=>'Ŭ', 
'E9'=>'Ĕ', 
'O9'=>'Ŏ', 
'OU9'=>'Ŏ͘',  
'M9'=>'M̆ ', 
'N9'=>'N̆g',  
/****************************************/

    'II0' => 'Ṳ',    // required
    'II2' => 'Ṳ́',
    'II3' => 'Ṳ̀',
    'II4' => 'Ṳ',    // required
    'II5' => 'Ṳ̂',
    'II7' => 'Ṳ̄',	//not used
    'II8' => '̍Ṳ̍',

    'ii0' => 'ṳ',    // required
    'ii2' => 'ṳ́',
    'ii3' => 'ṳ̀',
    'ii4' => 'ṳ',    // required
    'ii5' => 'ṳ̂',
    'ii7' => 'ṳ̄',	//not used
    'ii8' => 'ṳ̍'
/******************************************/
);

// *********************************
// * ASCII-TP Dictionary           *
// *********************************
//Holo
$map_tp = array(

    'A2' => 'Á',    // &#193;
    'A3' => 'À',    // &#192;
    'A5' => 'Â',    // &#194;
    'A8' => 'Ã',    // &#195;
    'A7' => 'Ä',    // &#196;

    'a3' => 'à',    // &#224;
    'a2' => 'á',    // &#225;
    'a5' => 'â',    // &#226;
    'a8' => 'ã',    // &#227;
    'a7' => 'ä',    // &#228;

    'E2' => 'É',    // &#201;
    'E3' => 'È',    // &#200;
    'E5' => 'Ê',    // &#202;
    'E8' => 'Ç',    // &#199;
    'E7' => 'Ë',    // &#203;

    'e8' => 'ç',    // &#231;
    'e3' => 'è',    // &#232;
    'e2' => 'é',    // &#233;
    'e5' => 'ê',    // &#234;
    'e7' => 'ë',    // &#235;

    'I7' => '‚',    // &#130;
    'I8' => 'ƒ',    // &#131;
    'I3' => 'Ì',    // &#204;
    'I2' => 'Í',    // &#205;
    'I5' => 'Î',    // &#206;

    'i3' => 'ì',    // &#236;
    'i2' => 'í',    // &#237;
    'i5' => 'î',    // &#238;
    'i7' => '„',    // &#132;
    'i8' => '…',    // &#133;

    'M2' => 'ˆ',    // &#136;
    'M3' => '‰',    // &#137;
    'M5' => 'Š',    // &#138;
    'M8' => 'Œ',    // &#140;
    'M7' => '‹',    // &#139;

    'm2' => '•',    // &#149;
    'm3' => '–',    // &#150;
    'm5' => '—',    // &#151;
    'm7' => '˜',    // &#152;
    'm8' => '™',    // &#153;

    'nn' => '°',    // &#176;

    'N2' => 'š',    // &#154;
    'N3' => '›',    // &#155;
    'N5' => 'œ',    // &#156;
    'N8' => 'Ñ',    // &#209;
    'N7' => 'Ÿ',    // &#159;

    'n2' => '¡',    // &#161;
    'n3' => '¢',    // &#162;
    'n5' => '£',    // &#163;
    'n8' => 'ñ',    // &#241;
    'n7' => '¤',    // &#164;

    'O2' => 'Ó',    // &#211;
    'O3' => 'Ò',    // &#210;
    'O5' => 'Ô',    // &#212;
    'O8' => 'Õ',    // &#213;
    'O7' => 'Ö',    // &#214;

    'o3' => 'ò',    // &#242;
    'o2' => 'ó',    // &#243;
    'o5' => 'ô',    // &#244;
    'o8' => 'õ',    // &#245;
    'o7' => 'ö',    // &#246;

    'OU' => '¥',    // &#165; (required)
    'OU4' => '¥',    // &#165; (required)
    'OU2' => '¦',    // &#166;
    'OU3' => '§',    // &#167;
    'OU5' => '¨',    // &#168;
    'OU8' => '«',    // &#171;
    'OU7' => 'ª',    // &#170;

    'ou' => '¬',    // &#172; (required)
    'ou4' => '¬',    // &#172; (required)
    'ou3' => '±',    // &#177;
    'ou2' => '¯',    // &#175;
    'ou5' => '²',    // &#178;
    'ou8' => '´',    // &#180;
    'ou7' => '³',    // &#179;

    'U2' => 'Ú',    // &#218;
    'U3' => 'Ù',    // &#217;
    'U5' => 'Û',    // &#219;
    'U8' => 'Ý',    // &#221;
    'U7' => 'Ü',    // &#220;

    'u3' => 'ù',    // &#249;
    'u2' => 'ú',    // &#250;
    'u5' => 'û',    // &#251;
    'u7' => 'ü',    // &#252;
    'u8' => 'ý',    // &#253;

/****************************************/

    'II' => 'µ',    // required
    'II2' => '¶',
    'II3' => '¸',
    'II4' => 'µ',    // required
    'II5' => '¹',
    //'II7' => '',	//not available in TP
    'II8' => '̍º',

    'ii' => '»',    // required
    'ii2' => '¼',
    'ii3' => '½',
    'ii4' => 'ṳ',    // required
    'ii5' => '¾',
    //'ii7' => '=»',	//not available in TP
    'ii8' => '¿'
/***********************************************/
);

// *********************************
// * ASCII-HOTSYS Dictionary           *
// *********************************

//Holo
$map_hotsys = array(

    'a2' => '¡',    // &#161;
    'a3' => '…',    // &#133;
    'a5' => 'ƒ',    // &#131;
    'a7' => '„',    // &#132;
    'i2' => '›',    // &#155;
    'i3' => '¢',    // &#162;
    'i5' => 'Œ',    // &#140;
    'i7' => '‹',    // &#139;
    'i8' => 'Ÿ',    // &#159;
    'u2' => '154',    // &#154;
    'u3' => '—',    // &#151;
    'u5' => '–',    // &#150;
    'u7' => 'ò',    // &#242;
    'e2' => '‚',    // &#130;
    'e3' => 'Š',    // &#138;
    'e5' => 'ˆ',    // &#136;
    'e7' => '‰',    // &#137;
    'e8' => '˜',    // &#152;
    'o2' => 'à',    // &#224;
    'o3' => '•',    // &#149;
    'o5' => 'â',    // &#226;
    'o7' => 'ã',    // &#227;
    'ou2' => '£',    // &#163;
    'ou3' => '¤',    // &#164;
    'ou5' => '¥',    // &#165; (required)
    'ou7' => '¦',    // &#166;
    'ou8' => '§',    // &#167;
    'm2' => 'Ê',    // &#202;
    'm3' => 'Ë',    // &#203;
    'm5' => 'Ì',    // &#204;
    'm8' => 'Í',    // &#205;
    'n5' => 'Ç',    // &#199;
    'n7' => 'È',    // &#200;
    'n8' => 'É',    // &#201;
    'u2' => 'Ý',    // &#221;
    'u3' => 'Ü',    // &#220;
    'u7' => 'á',    // &#225;
    'u8' => '™',    // &#153;

    'A2' => 'û',    // &#251;
    'A3' => 'ú',    // &#250;
    'A5' => 'ñ',    // &#241;
    'A7' => 'Î',    // &#206;
  
    'I3' => 'À',    // &#192;
    'U5' => 'Ù',    // &#217;
    'E2' => '³',    // &#179;
    'E3' => '´',    // &#180;
    'E7' => 'Â',    // &#194;
    'E8' => 'Ã',    // &#195;
    'O2' => 'Ó',    // &#211;
    'O3' => 'Ò',    // &#210;
    'O5' => 'Ô',    // &#212;
    'O8' => 'Õ',    // &#213;
    'O7' => 'Ö',    // &#214;
    'OU2' => '¬',    // &#172; (required)
    'OU3' => '«',    // &#171;
    
    'OU7' => '°',    // &#176;
    'OU8' => '¯',    // &#175;
    'M3' => 'ª',    // &#170;
    'M5' => '±',    // &#177;
    'M8' => '²',    // &#178;
    'U2' => 'Ú',    // &#218;
    'U5' => 'Ä',    // &#196;
    'U7' => 'Û',    // &#219;
    'U8' => 'Ñ',    // &#209;
    'ou' => '¨',    // &#168;
    'OU' => 'œ',    // &#156;
    'nn' => 'Á',    // &#193;
	'a8' => '', //134
'u8' => 'å', //229
'o8' => 'ß',   //223
'm7' => 'Þ',  //222
'n2' => 'Å',  //197
'n3' => 'Æ',     //198
'u5' => '',     //135
'A8' => 'Ï',  //207
'I2' => '¼',    //188
'I5' => '½',    //189
'I7' => '¾',   //190
'I8' => '¿',    //191
'U2' => 'Ø',   //216
'U3' => '×',     //215
'U7' => 'ÿ',    //255
'U8' => 'þ',    //254
'E5' => 'µ',    //181
'OU5' => '­',    //173
'M2' => '®',    //174
'M7' => '©',    //169
'N2' => '¹',   //185
'N3' => '¸',   //184
'N5' => 'º',   //186
'N7' => '·',    //183
'N8' => '»',  //187
'U3' => 'Ð'    //208
);
 //用來把一個parse過的羅馬拼音詞轉換成輸出編碼 mode=0 //unicode =1 tp =2 hotsys
 function tran_code($mode)
 {
	global $word,$mon,$mson,$map_utf8,$map_tp,$map_hotsys,$map_tailo,$mon_weight,$tmon_weight;
	if (strlen($word[1])==0) return;//沒有母音
	if ($mode==0) $map=$map_utf8;
	else if ($mode==1) $map=$map_tp;
	else if ($mode==2) $map=$map_hotsys;
	else if ($mode==3) $map=$map_tailo;
	else die("Error in mode = $mode");
	if (strlen($word[1])==1) $mpt=0;
	elseif (strncasecmp($word[1],'im',2)==0) $mpt=0;//erase im in
	elseif (strncasecmp($word[1],'in',2)==0) $mpt=0;
	elseif (strncasecmp($word[1],'ii',2)==0) $mpt=0;//add by tjm for Hakka
	elseif (strncasecmp($word[1],'i',1)==0) $mpt=1;
	else $mpt=0;
	/*************************************
	 echo 'son ';
                echo " $word[0] <br>\n";
                echo 'mon ';
                echo " $word[1] <br>\n";
                echo 'tail ';
                echo " $word[2] <br>\n";
                echo 'sound ';
                echo " $word[3] <br>\n";
         **************************************/
	//處理鼻音
	$str=$word[1];
	if (strcmp(substr($str,strlen($str)-1,1),'N')==0)
	{
		if ($mode==3)
			$pad='nn';
		else
			$pad=$map['nn'];
		$str=substr($str,0,strlen($str)-1);
	}
	elseif (strcmp(substr($str,strlen($str)-2,2),'nn')==0 && $mode!=3 )
	{
		$pad=$map['nn'];
		if ($mode==3)
			$pad='nn';
		else
			$pad=$map['nn'];
		$str=substr($str,0,strlen($str)-2);
	}
	else $pad='';
	$nstr='';
	$cnt=0;
	$cnt_mon=count($mon);
	$cnt_mson=count($mson);
	$mstak=array();
        $mscnt=0;
	while(strlen($str)>0)
	{
		for ($i=2;$i<$cnt_mon;$i=$i+1)//處理純母音
		{
			$code=$mon[$i];
			if (strncmp($str,$code,strlen($code))==0)
                        {
			   if ($cnt==$mpt)//加聲調
			   {
				$mstak[$mscnt++]=$code;
			   }
			   else
				$mstak[$mscnt++]=$code;
                           $str=substr($str,strlen($code));
			   $cnt=$cnt+1;
                           continue 2; //return while
                        }

		}
		for ($i=0;$i<$cnt_mson;$i=$i+1)//處理母子音共用
		{
			$code=$mson[$i];
			$ngpad='';
			if (strncmp($str,$code,strlen($code))==0)
                        {
			   if ($cnt==$mpt)//加聲調
			   {
				$mstak[$mscnt++]=$code;
			   }
			   else
				$mstak[$mscnt++]=$code;
                           $str=substr($str,strlen($code));
			   $cnt=$cnt+1;
                           continue 2; //return while
                        }
		}
		echo "error in ".$str;
		 $str=substr($str,1);
	}//while
	$maxs=-3;
	$maxpt=0;
	$nstr='';
	$ngpad='';
	if ($mode==3 && (int) $_REQUEST['trad']==0) //台羅狀態時，計算響度最大
	{
		for ($i=0;$i<$mscnt;$i=$i+1)
		{
			$nows=(int) $tmon_weight[$mstak[$i]];
			if ($nows > $maxs)
			{
				$maxs=$nows;
				$maxpt=$i;
			}
		}
	}
	else
	{
		for ($i=0;$i<$mscnt;$i=$i+1)
		{
			$nows=(int) $mon_weight[$mstak[$i]];
			if ($nows > $maxs)
			{
				$maxs=$nows;
				$maxpt=$i;
			}
		}
	}
	for ($i=0;$i<$mscnt;$i=$i+1)
	{
		$code=$mstak[$i];
		if ($i==$maxpt) //add 1234
		{
			 if (strcasecmp($code,'ng')==0 && (int) $word[3]>0) //ng3 to n3g
                         {
                                 $sear=substr($code,0,1).$word[3];
                                 $ngpad=substr($code,1,1);
                         }
                         else
                         	$sear=$code.$word[3];
		}
		else $sear=$code;
		if (strlen($map[$sear])==0) // 找不到
                     $nstr=$nstr.$code;
                else
                      $nstr=$nstr.$map[$sear];
	}
	$word[1]=$nstr.$ngpad.$pad;
 }
 //用來把羅馬拼音parse 成四個部份
 function par_ro($str)
 {
	global $mon, $son,$mson,$tail,$sound,$word,$status;
	$str=trim($str);
	$len=strlen($str);
	$status=1;
 	$word=array('','','',0);
	if ($len<=0) return('');
	//鼻音N或nn
	//一個羅馬拼音是由 [子音]母音[入聲尾][調號] 組成，一定有母音
	$mode=0;
	$pt=0;
	$tmpmon='';
         $bktmpmon='';
	while ($len>0)//parse 主迴圈
	{
		switch ($mode)
		{
			case 0: //檢查母子音共用
     				foreach ($mson as $code) 
				{
					if (strncmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=$word[$mode].$code;
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					     $tmpmon=$code;
						$mode=1;
					     continue 3; //return while
					}
				}
				//沒成功，檢查子音
     				foreach ($son as $code) 
				{
					if (strncasecmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=$word[$mode].substr($str,0,strlen($code));
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					 	 $bktmpmon=$tmpmon;//hmh
					     $tmpmon='';
						$mode=1;
					     continue 3; //return while
					}
	     			}
				//鐵定進入母音區
				$mode=1;
			case 1:
				//檢查共用母音
     				foreach ($mson as $code) 
				{
					if (strncmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=$word[$mode].$code;
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					     $tmpmon='';
					     continue 3; //return while
					}
				}
				//檢查母音
     				foreach ($mon as $code) 
				{
					if (strncmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=$word[$mode].$code;
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					     $tmpmon='';
					     continue 3; //return while
					}
	     			}
				//沒母音檢查共用母音
				if (strlen($tmpmon)>0)
				{
					$word[$mode]=$tmpmon;
					$testw=substr($word[0],strlen($word[0])-strlen($tmpmon));
					if (strncmp($testw,$tmpmon,strlen($tmpmon))==0)
						$word[0]=substr($word[0],0,strlen($word[0])-strlen($tmpmon));
					//echo "tmpmon= $tmpmon $testw<br>\n";
				} 
				else//hmh這種問題，入聲詞尾只有一個字母
                                {
                                        if (strlen($bktmpmon)>0)
                                        {
                                                $word[$mode]=$bktmpmon;
                                                $word[2]=substr($word[0],strlen($word[0])-1);
                                                $word[0]=substr($word[0],0,strlen($word[0])-1);//除去入聲尾
                                                $testw=substr($word[0],strlen($word[0])-strlen($bktmpmon));
                                                if (strncmp($testw,$bktmpmon,strlen($bktmpmon))==0)
                                                        $word[0]=substr($word[0],0,strlen($word[0])-strlen($bktmpmon));
                                        }
                                }
				$mode=2;
			case 2:
				//檢查入聲詞尾
     				foreach ($tail as $code) 
				{
					if (strncasecmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=$word[$mode].substr($str,0,strlen($code));
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					     $mode=3;
					     continue 3; //return while
					}
				}
				$mode=3;
			case 3://檢查調號
     				foreach ($sound as $code) 
				{
					if (strncmp($str,$code,strlen($code))==0)
					{
					     $word[$mode]=(int) $code;
					     $str=substr($str,strlen($code));
					     $len=strlen($str);
					}
				}
				//最後檢查是否還有剩餘，如果還有剩餘，就是error
				if (strlen($str)>0 || strlen($word[1])==0)
					$status=0;
				else    $status=1;
				$len=0; //一定跳出去
				continue 2;

		}//switch
	}//WHILE
	 //如果沒有調號、鼻音與ou就不用轉
        //if (strlen($word[2])==0 && (int) $word[3]==0 && stristr($word[1],'ou')===false 
 	//	&& (strcmp(substr($word[1],strlen($word[1])-1,1),'N')!=0))
         //        $status=0;
	return $status;
 }
 //用來把整段文章轉成 
 function to_code($txt,$graph,$mode)
 {
	global $word;
	$ans='';
	$tok='';
	if ($mode>0) //not unicode
		$graph=0;
        if ($graph==1)
        {
		require('mfont.php');
        }
	while (strlen($txt)>0)
	{
		$now=substr($txt,0,1);
		$txt=substr($txt,1);
		$asc=ord($now);
		if ((strlen($tok)>0 && 48<=$asc && $asc<=57)||(65<=$asc && $asc<=90)||(97<=$asc && $asc<=122))
		{
			$tok=$tok.$now;
		}
		else//不是羅馬拼音範圍
		{
			if (strlen($tok)>0)//有東西
			{
				 if (par_ro($tok))
                		{
                        		tran_code($mode);
					if ($graph==0)
                        			$ans=$ans.$word[0].$word[1].$word[2];
					else
						$ans=$ans.mfont($word[0].$word[1].$word[2]);
					
                		}
				else 
				{
					//echo "error in $tok <br>\n";
					$ans=$ans.$tok;
				}
				$tok='';
			}//strlen($tok)
			if ($asc>0x80)//unicode 中文
                        {
                                $nc=1;
                                if ($asc>=0xFC) $nc=6;
                                else if ($asc>=0xF8) $nc=5;
                                else if ($asc>=0xF0) $nc=4;
                                else if ($asc>=0xF0) $nc=3;
                                else if ($asc>=0xE0) $nc=2;
                                else if ($asc>=0xC0) $nc=1;
                                $ans=$ans.$now.substr($txt,0,$nc);
                                 $txt=substr($txt,$nc);
                        }
			else
			{
				$ans=$ans.$now;
			}
		}
	}//while
	if (strlen($tok)>0)//有東西
        {
               if (par_ro($tok))
               {
                        tran_code($mode);
			if ($graph==0)
                       		$ans=$ans.$word[0].$word[1].$word[2];
			else
				$ans=$ans.mfont($word[0].$word[1].$word[2]);
               }
               else
               {
                        //echo "error in $tok <br>\n";
                        $ans=$ans.$tok;
               }
               $tok='';
       }//strlen($tok)
	return $ans;
 }
function to_num($txt,$mode)
{
    global $map_tp,$map_hotsys,$map_utf8,$map_tailo;
    $delmit=array(' ',"\n","\r","\t",',','.','?',';','!','=','(',')','[',']','{','}','-');
        $ans='';
	$isnum='';
        while (strlen($txt)>0)
        {
                $now=iconv_substr( $txt  , 0  , 2  , 'utf-8'  );
		$test=iconv_substr( $txt  , 0  , 2  , 'utf-8'  );
		if ($mode==1)
                                $key = array_search($test, $map_tp);
                else if ($mode==2)
                                $key = array_search($test, $map_hotsys);
                else if ($mode==3)
                                $key = array_search($test, $map_utf8);
                else if ($mode==4)
                                $key = array_search($test, $map_tailo);
                else die("error in mode");
		if ($key===FALSE)
		{
                	$now=iconv_substr( $txt  , 0  , 1  , 'utf-8'  );
			$test=iconv_substr( $txt  , 0  , 1  , 'utf-8'  );
			$txt=substr($txt,strlen($test));
                	$asc=ord($now);
			if (in_array($now,$delmit)||$asc<65 || $asc>122||($asc>=91 && $asc<=96)) 
			{
				$ans=$ans.$isnum;
				$isnum='';
			}
			if ($mode==1)
				$key = array_search($test, $map_tp);
			else if ($mode==2)
				$key = array_search($test, $map_hotsys);
			else if ($mode==3)
				$key = array_search($test, $map_utf8);
			else if ($mode==4)
                                $key = array_search($test, $map_tailo);
			else die("error in mode");
		}
		else
		{
			$txt=substr($txt,strlen($test));
		}
		if ($key===FALSE)//not found
		{
			$ans=$ans.$now;
		}
		else
		{
		    if ((int) substr($key,strlen($key)-1) > 0) //有數字調號
		    {
			$isnum=substr($key,strlen($key)-1);
			$key=substr($key,0,strlen($key)-1);
		    }
		    else if (strcmp('0',substr($key,strlen($key)-1))==0) //調號0
		    {
			$key=substr($key,0,strlen($key)-1);
		    }
		    //鼻音前有數字調號
		    if (strcmp($key,"nn")==0 && (int) substr($ans,strlen($ans)-1) > 0)
		    {
		    	$ans=substr($ans,0,strlen($ans)-1).$key.substr($ans,strlen($ans)-1);
		    }
		    else
		    	$ans=$ans.$key;
		}
        }//while
	$ans=$ans.$isnum;
	return $ans;
}

 $txtbuf=$_REQUEST['txt'];
 set_time_limit(300);
 //$OORG=split("[[:punct:]]|[[:space:]]",$txtbuf); //這裡應該要參照一下希臘文的分割狀況
 $OORG=preg_split("/\W/",$txtbuf); //這裡應該要參照一下希臘文的分割狀況
 $cnt=count($OORG);
 echo "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n</head>\n<body>"; 
 echo '<a href="index.html">Again</a><p />';
 if ((int) $_REQUEST['code']==1) //TP
        $txtbuf=to_num($txtbuf,1);
 elseif ((int) $_REQUEST['code']==2) //hotsys
        $txtbuf=to_num($txtbuf,2);
 elseif ((int) $_REQUEST['code']==3) //unicode
        $txtbuf=to_num($txtbuf,3);
 elseif ((int) $_REQUEST['code']==4) //TAI_LO
 {
        $txtbuf=to_num($txtbuf,4);
	$txtbuf=str_replace('ts','ch',$txtbuf);
	$txtbuf=str_replace('oo','ou',$txtbuf);
	$txtbuf=str_replace('nn','N',$txtbuf);
	$txtbuf=str_replace('ua','oa',$txtbuf);
	$txtbuf=str_replace('ue','oe',$txtbuf);
	$txtbuf=str_replace('ing','eng',$txtbuf);
	$txtbuf=str_replace('ik','ek',$txtbuf);
	$txtbuf=str_replace('Ts','Ch',$txtbuf);
	$txtbuf=str_replace('Oo','Ou',$txtbuf);
	$txtbuf=str_replace('Nn','N',$txtbuf);
	$txtbuf=str_replace('Ua','Oa',$txtbuf);
	$txtbuf=str_replace('Ue','Oe',$txtbuf);
	$txtbuf=str_replace('Ing','Eng',$txtbuf);
	$txtbuf=str_replace('Ik','Ek',$txtbuf);
	$txtbuf=str_replace('TS','CH',$txtbuf);
	$txtbuf=str_replace('OO','OU',$txtbuf);
	$txtbuf=str_replace('NN','N',$txtbuf);
	$txtbuf=str_replace('UA','OA',$txtbuf);
	$txtbuf=str_replace('UE','OE',$txtbuf);
	$txtbuf=str_replace('ING','ENG',$txtbuf);
	$txtbuf=str_replace('IK','EK',$txtbuf);
 }
 elseif ((int) $_REQUEST['code']==5) //TAI_LO number
 {
	$txtbuf=str_replace('ts','ch',$txtbuf);
	$txtbuf=str_replace('oo','ou',$txtbuf);
	$txtbuf=str_replace('nn','N',$txtbuf);
	$txtbuf=str_replace('ua','oa',$txtbuf);
	$txtbuf=str_replace('ue','oe',$txtbuf);
	$txtbuf=str_replace('ing','eng',$txtbuf);
	$txtbuf=str_replace('ik','ek',$txtbuf);
	$txtbuf=str_replace('Ts','Ch',$txtbuf);
        $txtbuf=str_replace('Oo','Ou',$txtbuf);
        $txtbuf=str_replace('Nn','N',$txtbuf);
        $txtbuf=str_replace('Ua','Oa',$txtbuf);
        $txtbuf=str_replace('Ue','Oe',$txtbuf);
        $txtbuf=str_replace('Ing','Eng',$txtbuf);
        $txtbuf=str_replace('Ik','Ek',$txtbuf);
        $txtbuf=str_replace('TS','CH',$txtbuf);
        $txtbuf=str_replace('OO','OU',$txtbuf);
        $txtbuf=str_replace('NN','N',$txtbuf);
        $txtbuf=str_replace('UA','OA',$txtbuf);
        $txtbuf=str_replace('UE','OE',$txtbuf);
        $txtbuf=str_replace('ING','ENG',$txtbuf);
        $txtbuf=str_replace('IK','EK',$txtbuf);
 }
 if ((int) $_REQUEST['ocode']==1)  //number
 {
	echo 'Output:<br />';
 	//echo $txtbuf;
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
	echo $txtbuf;
	echo "</textarea><p />\n";
 }
 else if ((int) $_REQUEST['ocode']==0)  //unicode
 {
	echo 'Unicode:<br />';
 	//echo $txtbuf;
	//$vpt=time();
	//echo $vpt;
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
 	$outstr=to_code($txtbuf,0,0);
 	echo $outstr;
 	echo "</textarea><p />\n";
	//$nvpt=time();
	//echo ($nvpt-$vpt);
 	echo "Graph Based Unicode:<br />";
 	echo nl2br(to_code($txtbuf,1,0));
	//$nvpt1=time();
	//echo ($nvpt1-$nvpt);
 }
 else if ((int) $_REQUEST['ocode']==2)  //TP
 {
	echo 'TP code:<br />';
 	//echo $txtbuf;
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
 	$outstr=to_code($txtbuf,0,1);
 	echo $outstr;
 	echo "</textarea><p />\n";
 }
 else if ((int) $_REQUEST['ocode']==3)  //HOTSYS
 {
	echo 'HOTSYS code:<br />';
 	//echo $txtbuf;
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
 	$outstr=to_code($txtbuf,0,2);
 	echo $outstr;
 	echo "</textarea><p />\n";
 }
 else if ((int) $_REQUEST['ocode']==4)  //TAI_LO
 {
	echo 'TAI_LO code:<br />';
	$txtbuf=str_replace('ch','ts',$txtbuf);
	$txtbuf=str_replace('ou','oo',$txtbuf);
	//$txtbuf=str_replace('N','nn',$txtbuf);
	$txtbuf=str_replace('oa','ua',$txtbuf);
	$txtbuf=str_replace('oe','ue',$txtbuf);
	$txtbuf=str_replace('eng','ing',$txtbuf);
	$txtbuf=str_replace('ek','ik',$txtbuf);
	$txtbuf=str_replace('Ch','Ts',$txtbuf);
	$txtbuf=str_replace('Ou','OO',$txtbuf);
	$txtbuf=str_replace('Oa','Ua',$txtbuf);
	$txtbuf=str_replace('Oe','Ue',$txtbuf);
	$txtbuf=str_replace('Eng','Ing',$txtbuf);
	$txtbuf=str_replace('Ek','Ik',$txtbuf);
	$txtbuf=str_replace('CH','TS',$txtbuf);
	$txtbuf=str_replace('OU','OO',$txtbuf);
	$txtbuf=str_replace('OA','UA',$txtbuf);
	$txtbuf=str_replace('OE','UE',$txtbuf);
	$txtbuf=str_replace('ENG','ING',$txtbuf);
	$txtbuf=str_replace('EK','IK',$txtbuf);
 	$mon=array('N','nn','oo','a','i','u','e','o','OO','Oo','A','I','U','E','O');//母音
 	$son=array('tsh','ts','kh','th','ph','p','t','k','b','g','l',
	   'j','h','s');//子音
	//'f','v','y' 客語用，嚴格檢查拿掉
 	$mson=array('ng','m','n','NG','M','Ng','N');//母子音共用
 	$outstr=to_code($txtbuf,0,3);
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
 	echo $outstr;
 	echo "</textarea><p />\n";
 }
 else if ((int) $_REQUEST['ocode']==5)  //TAI_LO num
 {
	echo 'TAI_LO code:<br />';
	$txtbuf=str_replace('ch','ts',$txtbuf);
	$txtbuf=str_replace('ou','oo',$txtbuf);
	$txtbuf=str_replace('N','nn',$txtbuf); // why remove this ? 2007 04 09
	$txtbuf=str_replace('oa','ua',$txtbuf);
	$txtbuf=str_replace('oe','ue',$txtbuf);
	$txtbuf=str_replace('eng','ing',$txtbuf);
	$txtbuf=str_replace('ek','ik',$txtbuf);
	$txtbuf=str_replace('Ch','Ts',$txtbuf);
	$txtbuf=str_replace('Ou','Oo',$txtbuf);
	$txtbuf=str_replace('Oa','Ua',$txtbuf);
	$txtbuf=str_replace('Oe','Ue',$txtbuf);
	$txtbuf=str_replace('Eng','Ing',$txtbuf);
	$txtbuf=str_replace('Ek','Ik',$txtbuf);
	$txtbuf=str_replace('CH','TS',$txtbuf);
	$txtbuf=str_replace('OU','OO',$txtbuf);
	$txtbuf=str_replace('OA','UA',$txtbuf);
	$txtbuf=str_replace('OE','UE',$txtbuf);
	$txtbuf=str_replace('ENG','ING',$txtbuf);
	$txtbuf=str_replace('EK','IK',$txtbuf);
 	echo "<textarea name=\"aa\" rows=10 cols=70>";
 	echo $txtbuf;
 	echo "</textarea><p />\n";
 }
 echo '<a href="index.html">Again</a></body></html>';
?>
