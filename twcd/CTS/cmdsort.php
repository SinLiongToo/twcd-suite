<?php
if ($argc < 3)
    die($argv[0]." mode input_filename output_filename");
$txtbuf=join("",file($argv[2]));
$OORG=split("\n",$txtbuf);
sort($OORG);
$mode=(int) $argv[1];
$fp=fopen($argv[3],"w");
if ($mode==0)
{
        for ($i=0;$i<count($OORG) ;$i=$i+1)
        {
                //echo $OORG[$i]."<br/>";
                fwrite($fp,$OORG[$i]."\n");
        }
}
else
{
        for ($i=count($OORG)-1;$i>=0 ;$i=$i-1)
        {
                //echo $OORG[$i]."<br/>";
                  fwrite($fp,$OORG[$i]."\n");
        }
}
fclose($fp);
?>

