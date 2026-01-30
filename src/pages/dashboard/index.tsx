import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { db } from "../../services/firebaseConnection";
import { collection, addDoc } from "firebase/firestore";

interface NomeProps {
  user: {
    email: string;
  };
}

export default function Dashboard({ user }: NomeProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  
  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.checked);
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();
    if(input === '') return;
    if(!user?.email) return;

    try{
      await addDoc(collection(db, "tasks"), {
        tarefa: input,
        public: publicTask,
        user: user.email,
        createdAt: new Date(),
      });
      setInput("");
      setPublicTask(false);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea placeholder="Digite sua tarefa aqui..." value={input} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                setInput(event.target.value)
              }} />
              <div className={styles.checkboxArea}>
                <input type="checkbox" className={styles.checkbox} checked={publicTask} onChange={handleChangePublic} />
                <label>Deixar tarefa pública?</label>
              </div>
              <button type="submit" className={styles.button}>
                Criar tarefa
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
