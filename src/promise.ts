function saveMetrics(memPercent: number){
return new Promise((resolve,reject)=>{
setTimeout(()=>resolve(`Metrics saved: ${memPercent}%`),500000001)
})

}
async function main() {
  try {
    const result = await saveMetrics(82.31)
    console.log(result)
  } catch(error) {
    console.log("error")
  }
}

main()