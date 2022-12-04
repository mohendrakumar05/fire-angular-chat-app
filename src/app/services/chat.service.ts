import { Injectable } from '@angular/core';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import { collectionData, Firestore, orderBy, serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@firebase/auth';
import { addDoc, collection , setDoc, doc, query, where, getDocs } from "@angular/fire/firestore"; 
// import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User{
  uid: string;
  email: string;
}

export interface Message {
  createdAt : Date,
  id: string,
  from: string,
  msg: string,
  fromName: string,
  myMsg: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // currentUser : User = null ;
  currentUser: any = null;
  // auth :any = getAuth();
  auth :any;
  constructor(private firestore : Firestore, private router: Router ) { 
    
    this.auth = getAuth();
    onAuthStateChanged(this.auth, (user) =>{
      if(user){
        // const uid = user.uid;
        this.currentUser = user;
        localStorage.setItem('users', JSON.stringify(this.currentUser));
        console.log('onAuthStateChanged: user if part');
        console.log(`onAuthStateChanged: currentUser = ${JSON.stringify(this.currentUser)}`);
        
      }else{
        localStorage.setItem('users', '');
        console.log('onAuthStateChanged: user else part');

      }
    });

  }

  //right work
  async signup({email , password } : any) : Promise<any> {
    console.log(`signup: email = ${email} password= ${password}`);
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password );
    // .then((userCredential : any) =>{
      // const user = userCredential.user;
      // console.log(`signup: userCredential= ${JSON.stringify(user)}`); // return object like uid, email etc..
      const uid = userCredential.user.uid;
      console.log(`signup: userCredential uid= ${uid}`); // return uid
      console.log(`signup: userCredential email= ${userCredential.user.email}`);
      const docRef = setDoc(doc(this.firestore, `users`, `${uid}`), {
        uid,
        email: userCredential.user.email,
      });      
  
      console.log(`docRef: ${JSON.stringify(docRef)}`);
      // return docRef;
  
      // this.router.navigate(['/login']);
    // }).catch((error: any) =>{
    //   console.log(`signup failed errr ${error}}`);
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    // })
  }

  // right work
  async signIn({email , password } : any){
    console.log(`signin: email = ${email} password= ${password}`);
    await signInWithEmailAndPassword(this.auth, email, password)
    .then((userCredential) =>{
      console.log(`signin: userCredential= ${userCredential}`);
      localStorage.setItem('token', 'true');
      // this.router.navigate(['/chat']); // not used
    }, err =>{
      const errorCode = err.code;
      const errorMessage = err.message;
      console.log(`signin failed errr code= ${errorCode}, errr msg= ${errorMessage}`);
       // this.router.navigate(['/login']);
    })
  }

  async signOut(){
    await signOut(this.auth).then((userCredential) =>{
      console.log(`signout: userCredential= ${userCredential}`);
      localStorage.removeItem('token');
      // this.router.navigate(['/login']);
    }, err =>{
      const errorCode = err.code;
      const errorMessage = err.message;
      console.log(`signout failed errr code= ${errorCode}, errr msg= ${errorMessage}`);
       // this.router.navigate(['/login']);
    })
  }

  async addChatMessage(msg: any){
    console.log(`addchatMessage: msg = ${JSON.stringify(msg)}`);
    // const docRef = await addDoc(collection(this.firestore, "messages"), {
    //   msg: msg,
    //   from:  this.currentUser.uid,
    //   createdAt: serverTimestamp()
    // });
      const messageRef = collection(this.firestore, 'messages');
      const message = {
        msg: msg,
        from:  this.currentUser.uid,
        createdAt: Date.now()
      };
      console.log(`addchatmsg message: ${JSON.stringify(message)}`);
      addDoc(messageRef, message);
    // return addDoc(messageRef, message);
   
  }

    // getNotes(): Observable<note[]> {
  //   const notesRef = collection(this.firestore, 'notes');
  //   return collectionData(notesRef, { idField: 'id'}) as Observable<note[]>;
  // }
  
  getUsers() {
    // return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
    const userRef =  collection(this.firestore, 'users');
    console.log(`getUsers: userref= ${JSON.stringify(userRef)}`);
    return  collectionData(userRef, {idField: 'uid'}) as Observable<User[]>;
  }
  

   getUserForMsg(msgFromId: any, users: User[]): string {
    console.log(`getUserForMsg: msgfromid= ${msgFromId}`);
    console.log(`users: ${users}`);
    for (let usr of users) {
      console.log(`getUserForMsg: usr= ${usr}`);
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    // return 'Unknown';
    return 'Deleted';
  }


  async getChatMessages() {
    console.log(`......get chat messages......`);
    let users: any = [];
    return this.getUsers().pipe(
      switchMap( res => {
        console.log(`switchMap users res: ${JSON.stringify(res)}`);
        users = res;
        console.log(`switchMap users: ${JSON.stringify(users)}`);
        const userRef = collection(this.firestore, 'messages');
        const q = query(userRef, orderBy("createdAt", "asc"));
        // console.log(`switchMap q: ${JSON.stringify(q)}`);
        return collectionData(q, {idField: 'id'}) as Observable<Message[]>;
      }),
      map(messages => {
        // Get the real name for each user
        console.log(`map messages: ${JSON.stringify(messages)}`);
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
        return messages
      })
    )
  }



}



