import { Input } from 'antd'
import Form from 'antd/lib/form/Form'
import Modal from 'antd/lib/modal/Modal'
import React, { useContext } from 'react'
import { AppContext } from '../../Context/AppProvider'

export default function Modalcall() {
    const { modalcall, setModalcall} = useContext(AppContext)
    function handleOk(){

    }
    return (
        <Modal
            title='Call'
            visible={modalcall}
            onOk={handleOk}
            onCancel={()=>setModalcall(false)}
        >
           
        </Modal>
    )
}
