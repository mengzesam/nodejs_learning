const superagent=require('superagent');
const select=require('xpath.js');
const dom=require('xmldom').DOMParser;
const fs=require('fs');
const href_prefix='https://www.zhihu.com';
const url_prefix='https://www.zhihu.com/collection/74918928?page=';
const file_name='data.csv';
const xpattern='/html/body/div[3]/div[1]/div/div[2]/div';
const xpat1='/html/body/div[3]/div[1]/div/div[2]/div[';
const xpat2=']/h2/a';
var start=1;
var pages=71;
cl_args=process.argv.splice(2);
var arg=parseInt(cl_args[0]);
if(!isNaN(arg)) start=arg;
if(cl_args.length==2)
arg=parseInt(cl_args[1]);
if(!isNaN(arg) && arg+start<=pages+1) pages=arg;
var pos_index=start;
var fail_pages=[];
spider_run();

function spider_run(){
    console.log(pos_index,pages);
    for(let j=start;j<start+pages;j++){
        superagent.get(url_prefix+j)
        .then(res =>{
            let xml=res.text;
            let doc=new dom().parseFromString(xml);
            let nodes0=select(doc,xpattern);
            let n=nodes0.length;
            for(let i=1;i<=n;i++){
                let nodes=select(doc,xpat1+i+xpat2);
                let href=new String(nodes[0].attributes.getNamedItem('href').value);
                if(href.match('https://')==null){
                    href=href_prefix+href;
                }                      
                let line=j+'\t'+i+'\t'+nodes[0].textContent+'\t'+href+'\n'
                fs.writeFile(file_name,line,{flag:'a'},function(err0) {
                    if (err0) {
                        throw err0;
                    }
                });
            }  
            if(pos_index%10==0){
                sleep(2000);
            }      
            pos_index++;        
        })
        .catch(err=>{
            console.log(j+':'+err.message);
            let line='page'+j+'\t'+err.message+'\n';
            fs.writeFile(file_name,line,{flag:'a'},function(err0) {
                if (err0) {
                    throw err0;
                }
            });
            fail_pages.push(j);
            pos_index++;
        });
    }
    return 0;
}

function sleep(numberMillis) {
	let now = new Date();
	let exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
		if (now.getTime() > exitTime)
		return;
    }
}
