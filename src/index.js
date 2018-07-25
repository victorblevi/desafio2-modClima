const https = require('https')

let count = 0;

const opt = {
  host: "s3-us-west-2.amazonaws.com",
  path: "/public.cyan-agro.com/data.csv"
}

console.log('Requesting csv file')

https.get(opt, res => {
  let offset = 0
  let line_count = 1
  let tip_amount_index;
  let tip_amount_sum = 0;
  console.log('Reading csv')
  res.on('readable', () => {
    let buf = res.read()
    process.stdout.write(`Lines: ${line_count}, Tips Amount: ${tip_amount_sum} \r`)
    if(!buf) {
      console.log('Lines: ', line_count)
      console.log('tip_amount_sum', tip_amount_sum)
      return;
    }
    for(; offset < buf.length; offset++){
      if(buf[offset] === 0x0a && buf[offset-1] === 0x0d){
        const fields = buf.slice(0, offset - 1).toString().split(',')
        if(line_count === 1)
          tip_amount_index = fields.indexOf('tip_amount')
        else{
          let tip_amount = parseInt(fields[tip_amount_index])
          tip_amount_sum += tip_amount ? tip_amount : 0
        }
        buf = buf.slice(offset + 1)
        offset = 0;
        ++line_count;
        res.unshift(buf)
        return
      }
    }
  })
})