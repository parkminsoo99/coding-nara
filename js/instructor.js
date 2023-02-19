const button_click = document.getElementById("lecture");
button_click.onclick= function disable(){
  button_click.disable= true;
  var start = new Date();  
  var end=0;
  if(end === 0)
  { 
  var end = start;
  end=1;
  }
  var diffTime = (end.getTime() - start.getTime()) / (1000*60*60);
  if(diffTime >= 20)
  {
    button_click.disable= false;
    end=0;
  }

}

  

  