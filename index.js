require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

process.env.TZ = "Asia/Jakarta";

//database
const db = require('./config/connection')
const collection = require('./config/collection')
const saver = require('./database/filesaver')

//DATABASE CONNECTION 
db.connect((err) => {
    if(err) { console.log('error connection db' + err); }
    else { console.log('db connected'); }
})

//Function
function first_name(ctx){
    return `${ctx.from.first_name ? ctx.from.first_name : ""}`;
}
function last_name(ctx){
    return `${ctx.from.last_name ? ctx.from.last_name : ""}`;
}
function username(ctx){
    return ctx.from.username ? `@${ctx.from.username}` : "";
}
function fromid(ctx){
    return ctx.from.id ? `[${ctx.from.id}]` : "";
}

bot.start(async(ctx)=>{
    if(ctx.chat.type == 'private') {
        const user = {
            first_name:ctx.from.first_name,
            userId:ctx.from.id
        }
        await ctx.deleteMessage(ctx.message.message_id)
        await ctx.reply(`Welcome <a href="tg://user?id=${ctx.from.id}">${first_name(ctx)} ${last_name(ctx)}</a> \n\nBot broadcast for Child Porn (CP) group information, don't delete the bot.`,{
            parse_mode:'HTML',
            disable_web_page_preview: true,
            reply_markup:{
                inline_keyboard:inKey
            }
        })
        await saver.saveUser(user)
    }
})

//broadcasting message to bot users(from last joined to first)
bot.command('broadcast',async(ctx)=>{
    if(ctx.chat.type == 'private') {
        const msg = ctx.message.text
        let msgArray = msg.split(' ')
        msgArray.shift()
        let text = msgArray.join(' ')
        const userDetails = await saver.getUser().then(async res =>{
            const n = res.length
            const userId = []
            for (let i = n-1; i >=0; i--) {
                userId.push(res[i].userId)
            }

            //broadcasting
            const totalBroadCast = 0
            const totalFail = []

            //creating function for broadcasting and to know bot user status
            async function broadcast(text) {
                for (const users of userId) {
                    try {
                        await bot.telegram.sendMessage(users, String(text),{
                            parse_mode:'HTML',
                            disable_web_page_preview: true
                          }
                        )
                    } catch (err) {
                        await saver.updateUser(users)
                        totalFail.push(users)

                    }
                }
                await ctx.reply(`✅ <b>Number of active users:</b> ${userId.length - totalFail.length}\n❌ <b>Total failed broadcasts:</b> ${totalFail.length}`,{
                    parse_mode:'HTML'
                })

            }
            let str = process.env.ADMIN;
        let result = str.includes(ctx.from.id);

        if(result == true){
                await ctx.deleteMessage(ctx.message.message_id)
                broadcast(text)
                await ctx.reply('Broadcast starts (Message is broadcast from last joined to first).')

            }else{
                await ctx.deleteMessage(ctx.message.message_id)
                await ctx.reply(`Commands can only be used by Admin.`) 
            }

        })
    }
    
})

bot.command('stats',async(ctx)=>{
    await ctx.deleteMessage(ctx.message.message_id)
    const stats = await saver.getUser().then(async res=>{
        let str = process.env.ADMIN;
        let result = str.includes(ctx.from.id);

        if(result == true){
            await ctx.reply(`📊 Total users: <b>${res.length}</b>`,{parse_mode:'HTML'})
        }
        
    })
})
 
//heroku config
const domain = `${process.env.DOMAIN}.herokuapp.com`
bot.launch({
    webhook:{
        domain:domain,
        port:Number(process.env.PORT) 
    }
})