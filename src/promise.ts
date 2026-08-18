function saveMetrics(memPercent: number){
return new Promise((resolve,reject)=>{
setTimeout(()=>resolve(`Metrics saved: ${memPercent}%`),499)
setTimeout(()=>reject("error"),500)
})


}

saveMetrics(82.31)
.then(result=>console.log(result))
.catch(error => console.log(`Error: ${error}`))