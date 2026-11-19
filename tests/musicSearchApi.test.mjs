import {readFile} from 'node:fs/promises'
import test from 'node:test'
import assert from 'node:assert/strict'
import ts from 'typescript'
const moduleUrl=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64')
const authUrl=moduleUrl(await readFile(new URL('../src/common/auth/accessToken.ts',import.meta.url),'utf8'))
const httpUrl=moduleUrl((await readFile(new URL('../src/common/api/http.ts',import.meta.url),'utf8')).replace('@/common/auth/accessToken',authUrl))
const apiUrl=moduleUrl((await readFile(new URL('../src/features/musicSearch/musicSearchApi.ts',import.meta.url),'utf8')).replace('@/common/api/http',httpUrl))
const {authSession}=await import(authUrl),{searchTracks}=await import(apiUrl)
const answer=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})
test('search uses team bearer auth and safely encodes the query; no provider keys in request',async()=>{
 const old=globalThis.fetch;authSession.replaceToken('test-access-token')
 try {globalThis.fetch=async(path,options)=>{
   const u=new URL(path,'http://local.test');assert.equal(u.pathname,'/api/spotify/tracks/search');assert.equal(u.searchParams.get('q'),'아이유 & love?');assert.equal(options.credentials,'include');assert.equal(options.headers.get('Authorization'),'Bearer test-access-token');assert.equal(options.method,'GET');assert.equal(options.signal,signal)
   return answer(200,{success:true,data:[]})
 };const signal=new AbortController().signal;assert.deepEqual(await searchTracks('아이유 & love?',signal),[])}finally{globalThis.fetch=old;authSession.replaceToken(null)}
})
test('expired access token delegates refresh to team module and retries once',async()=>{
 const old=globalThis.fetch;authSession.replaceToken('expired-test-token');let calls=0,refreshes=0
 authSession.configure(async()=>{refreshes++;authSession.setToken('new-test-token');return 'new-test-token'},()=>authSession.replaceToken(null))
 try {globalThis.fetch=async(_path,options)=>{calls++;if(calls===1)return answer(401,{code:'ACCESS_TOKEN_EXPIRED'});assert.equal(options.headers.get('Authorization'),'Bearer new-test-token');return answer(200,{success:true,data:[]})};await searchTracks('song',new AbortController().signal);assert.equal(calls,2);assert.equal(refreshes,1)}finally{globalThis.fetch=old;authSession.replaceToken(null)}
})
test('provider not configured and rate limit remain errors rather than fake empty results',async()=>{
 const old=globalThis.fetch
 try {for(const status of [503,429]){globalThis.fetch=async()=>answer(status,{success:false,code:status===503?'SPOTIFY_NOT_CONFIGURED':'SPOTIFY_RATE_LIMITED'});await assert.rejects(searchTracks('song',new AbortController().signal),e=>e.status===status)}}finally{globalThis.fetch=old}
})
