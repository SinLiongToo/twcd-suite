<?php
$NOTDIS=5;
if ($argc < 2)
    die($argv[0]." input_filename output_filename");
        $userfile_name=$_FILES['userfile']['name'];
        $userfile=$_FILES['userfile']['tmp_name'];
        $FILENAME=$argv[1];
        $OUTFILENAME=$argv[2];

    $all=file($FILENAME);
    $cnt=0;
    //$nn=array();
    $ci=count($all);
    $nn=array_values(array_unique($all));

                $fp=fopen($OUTFILENAME,"w");
        for ($j=0;$j<count($nn);$j++)
        {
                $nn[$j]=trim($nn[$j]);
                fputs($fp,$nn[$j]."\r\n");
        }
                fclose($fp);
        echo "輸入 ".count($all)." 筆";
        echo "輸出 ".count($nn)." 筆<br>\n";
        //echo "<a href=\"spool/result.txt\">成果在這裏</a>";
?>