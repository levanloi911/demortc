import { Button, Input } from 'antd'
import Form from 'antd/lib/form/Form'
import Modal from 'antd/lib/modal/Modal'
import Peer from 'peerjs'
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AppContext } from '../../Context/AppProvider'
import { AuthContext } from '../../Context/AuthProvider'
import { db } from '../../firebase/config'

export default function Modalcall() {
    const {
        user: { uid, photoURL, displayName },
    } = useContext(AuthContext);
    var peer = new Peer();
   
    peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);
    });
    const { Modalcall,  setModalcall} = useContext(AppContext) 
    const firestore = db;

    const servers = {
        iceServers: [
            {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    // Global State
    const pc = new RTCPeerConnection(servers);
    let localStream = null;
    let remoteStream = null;

    // 1. Setup media sources

    const webcamButton = async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();
let arr=[]
        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Pull tracks from remote stream, add to video stream
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
                arr.push({
                    ...remoteStream
                })
                console.log(arr, remoteStream)
            });
        };
        

        document.getElementById('webcamVideo').srcObject = localStream;
        document.getElementById('remoteVideo').srcObject = remoteStream;

        // callButton.disabled = false;
        // answerButton.disabled = false;
        // webcamButton.disabled = true;
    };

    // 2. Create an offer
  const   callButton = async () => {
        // Reference Firestore collections for signaling
        const callDoc = firestore.collection('calls').doc();
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

      document.getElementById('callInput').value = callDoc.id;

        // Get candidates for caller, save to db
        pc.onicecandidate = (event) => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        // Create offer
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        // Listen for remote answer
        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        answerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });

        // hangupButton.disabled = false;
    };

    // 3. Answer the call with the unique ID
   const answerButton = async () => {
       const callId = document.getElementById('callInput').value;
        const callDoc = firestore.collection('calls').doc(callId);
        const answerCandidates = callDoc.collection('answerCandidates');
        const offerCandidates = callDoc.collection('offerCandidates');

        pc.onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
        };

        const callData = (await callDoc.get()).data();

        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await callDoc.update({ answer });

        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                console.log(change);
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    };
    return (
        <div>
            <Modal
                title='Call'
                visible={Modalcall}
                // onOk={false}
                onCancel={() => setModalcall(false)}
            >
               
                <h2>1. Start your Webcam</h2>
                <div class="videos">
                    <span>
                        <h3>Local Stream</h3>
                        <video id="webcamVideo" style={{ zIndex: '10', width: '30%', height: '200px' }} muted autoPlay playsInline />

                    </span>
                    <span>
                        <h3>Remote Stream</h3>
                        <video id="remoteVideo" style={{ zIndex: '10', width: '30%', height: '200px' }} muted autoPlay playsInline />
                    </span>
                </div>
                <Button type='primary' id="webcamButton" onClick={() => webcamButton()}>Start webcam</Button>
                <h2>2. Create a new Call</h2>
                <Button type='primary' id="callButton" onClick={() => callButton()} >Create Call (offer)</Button>

                <h2>3. Join a Call</h2>
                <p>Answer the call from a different browser window or device</p>

                <input id="callInput" />
                <Button type='primary' id="answerButton" onClick={() => answerButton()}>Answer</Button>

                <h2>4. Hangup</h2>

                <Button type='primary' id="hangupButton"  >Hangup</Button>
              
            </Modal>
 
        </div>
  
    )
}
