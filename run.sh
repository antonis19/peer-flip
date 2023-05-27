#! /bin/bash
cd peer-flip-backend
npx tsc *.ts 
node server.js &
cd ../peer-flip-frontend
npm start &
for i in {1..2}; do open -g 'http://127.0.0.1:3000/'; done
cd ..
wait