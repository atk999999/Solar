import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css']) await copyFile(file,`dist/${file}`);
await cp('src','dist/src',{recursive:true});
await cp('public','dist',{recursive:true});
console.log('Built dist/: browser-only game, no external runtime dependencies.');
