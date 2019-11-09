import React, { useState } from 'react'
import { Modal, Form, Input, Icon, notification } from 'antd';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';

function ModalRegisterTime({ active, setActive, form: { getFieldDecorator, validateFields, resetFields } }) {
    
    const [mutate, { loading }] = useMutation(gql`
        mutation createTime($data: CreateTimeInput!){
            createTime(data: $data){
                id
                date_registered
                time_registered
                user{
                    id
                    name
                    email
                }
            }
        }
    `)

    function onModalSubmit() {
        validateFields(async (err, values) => {
            if (!err) {
                const user = JSON.parse(localStorage.getItem('user'))

                const { data, errors } = await mutate({
                    variables: {
                        data: { 
                            ...values,
                            user: {
                                id: +user.id
                            }
                        }
                    }
                })

                if(!errors){
                    notification.success({
                        message: `Tempo ${data.createTime.time_registered} registrado`
                    })
                    setActive(false)
                    resetFields()
                }
            }
        })
    }
    console.log(active)

    return (
        <Modal
            title="Registre seu tempo"
            visible={active}
            onOk={onModalSubmit}
            confirmLoading={loading}
            onCancel={() => setActive(false)}
        >
            <Form>
                <Form.Item>
                    {getFieldDecorator('date_registered', {
                        rules: [{ required: true, message: 'Informe a data' }],
                    })(
                        <Input
                            prefix={<Icon type="calendar" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Data"
                            type="date"
                        />,
                    )}
                </Form.Item>                
                <Form.Item>
                    {getFieldDecorator('time_registered', {
                        rules: [{ required: true, message: 'Informe o horário' }],
                    })(
                        <Input
                            prefix={<Icon type="time" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />,
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Form.create({ name: 'register-time' })(ModalRegisterTime)