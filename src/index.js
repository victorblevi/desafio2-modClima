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
  /*readable event triggers every time the stream data is ready to 
  be consumed and in some cases it can have increased throughput
   compared to data event, or piping*/
  res.on('readable', () => {
    let buf = res.read()
    // writes to console but force to write on same line
    process.stdout.write(`Lines: ${line_count}, Tips Amount: ${tip_amount_sum} \r`)
    // if there's nothing else in the stream, will show total of lines and tip amount.
    if(!buf) {
      console.log('The Program has ended reading the file from the web.')
      console.log('The total number of lines: ', line_count)
      console.log('The total tips sum:', tip_amount_sum)
      return;
    }
    //reads character by character from stream
    for(; offset < buf.length; offset++){
      //Checks if offset is '/n'
      if(buf[offset] === 0x0a && buf[offset-1] === 0x0d){
        //slice the string to the position of the offset that contains '/n' and transforms to an array
        const fields = buf.slice(0, offset - 1).toString().split(',')
        //if it's the header
        if(line_count === 1)
          //get the position of the field tip_amount
          tip_amount_index = fields.indexOf('tip_amount')
        else{
          //get the value of the type_amount field
          let tip_amount = parseInt(fields[tip_amount_index])
          //does the sum,if there is nothing in the field sum +0
          tip_amount_sum += tip_amount ? tip_amount: 0
        }
        //cleans everything that has processed up to the '/ n'
        buf = buf.slice(offset + 1)
        offset = 0;
        //count 1 line
        ++line_count;
        //return to stream everything that was after '/n'
        res.unshift(buf)
        return
      }
    }
  })
})