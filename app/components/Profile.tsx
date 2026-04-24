"use client"

import Link from "next/link";
import { useState } from "react";
import { Button, Checkbox, Label, Modal, ModalBody, ModalHeader, TextInput } from "flowbite-react";

export default function Profile () {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openShoppingCardModal, setOpenShoppingCardModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  function onCloseProfileModal() {
    setOpenProfileModal(false);
    setEmail("");
  }


  return (
    <div>
      <Button onClick={() => setOpenProfileModal(true)}>Toggle modal</Button>
        <Modal show={setOpenProfileModal} size="md" onClose={onCloseProfileModal} popup>
          <ModalHeader />
          <ModalBody>
            <div className="space-y-6">
              <div className="flex">
                <div>

                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Профиль клиента
                </h3>
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name">Your email</Label>
                </div>
                <TextInput
                  id="name"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                  required
                />
              </div>
              
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email">Your email</Label>
                </div>
                <TextInput
                  id="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="phone">Your email</Label>
                </div>
                <TextInput
                  id="phone"
                  placeholder="+7 ___ __ __"
                  value={phone}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember">
                    Я принимаю пользовательское соглашение и даю согласие на обработку ИП Таммет Яан Эдуардович моих персональных данных на условиях, определенных политикой конфиденциальности
                  </Label>
                </div>
                <a href="#" className="text-sm text-primary-700 hover:underline dark:text-primary-500">
                  Lost Password?
                </a>
              </div>
              <div className="w-full">
                <Button>Log in to your account</Button>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
                Not registered?&nbsp;
                <a href="#" className="text-primary-700 hover:underline dark:text-primary-500">
                  Отправить
                </a>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
  )
}