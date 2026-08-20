import os from "os";
import si from 'systeminformation'
export async function getMetrics(){
const totalMem=os.totalmem()
const freeMem=os.freemem()
const usedMem=totalMem-freeMem
const memPercent=((usedMem/totalMem)*100).toFixed(2)
const cpuModel=os.cpus()[0].model
const upTime=os.uptime()
const uptimeHours=Math.floor(upTime/3600)
const load = await si.currentLoad()
    return {
        memPercent,
        cpuModel,
        uptimeHours,
        cpuLoad: parseFloat(load.currentLoad.toFixed(2)),
    }
}
getMetrics() 

