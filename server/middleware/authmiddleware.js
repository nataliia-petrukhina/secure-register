import jwt from "jsonwebtoken"//Импортируем jsonwebtoken для работы с токенами.

const userAuth = async (req, res, next)=>{// Мы создаём функцию-мидлвару (промежуточную проверку).
    //req — данные, которые приходят от клиента (браузера)
    //res — данные, которые мы отправляем в ответ
    //next() — продолжить выполнение дальше, если всё ок


const { token } = req.cookies;// Мы достаём token из req.cookies.
//если токена нет ---success: false
if(!token){
    return res.json({success:false, message: "Unautorizied"})
} try {
    //jwt.verify проверяет, настоящий ли токен, и достаёт данные из него.
    //process.env.JWT_SECRET — это секретный код, который мы сами задали 
    //если токен подделан — проверка провалится ❌
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
    //Когда токен успешно расшифрован, мы достаём id пользователя, и добавляем его в req.body.
    console.log(token, tokenDecode);
    req.user = tokenDecode.id
  //Если всё хорошо, вызываем next() — это значит:
//"Пропускаем пользователя дальше."
   next()
} catch (error) {
    res.json({success:false, message:error.message, error:"middleware"})
}
}

export default userAuth;


//Токен — это строка, которая доказывает, что человек залогинен.eyJhbGciOiJIUzI1NiIsInR5cCI6...
