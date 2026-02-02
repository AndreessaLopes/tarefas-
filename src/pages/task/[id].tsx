import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { db } from "../../services/firebaseConnection";
import { doc, collection, query, where, getDoc, addDoc } from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

interface TaskProps {
  item: {
    id: string;
    tarefa: string;
    public: boolean;
    user: string;
    created: string;
  };
}

export default function Task({ item }: TaskProps) {
  const { data: session } = useSession();

  const [input, setInput] = useState("");

  async function handleComment(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;
    if (!session?.user?.email || !session?.user?.name) return;

    try{
        const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        taskId: item.id,
        user: session?.user?.name,
        userEmail: session?.user?.email,
        created: new Date(),
      });
      setInput("");
    }catch(err){
        console.log(err);
    }
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da Tarefa</title>
      </Head>
      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>
      </main>

      <section className={styles.commentContainer}>
        <h2>Deixar Comentário</h2>

        <form onSubmit={handleComment}>
          <Textarea
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
            placeholder="Digite seu comentário"
          />
          <button
            className={styles.button}
            type="submit"
            disabled={!session?.user}
          >
            Enviar Comentário
          </button>
        </form>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tasks", id);
  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;
  const task = {
    id: snapshot.id,
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString("pt-BR"),
    user: snapshot.data()?.user,
  };

  return {
    props: {
      item: task,
    },
  };
};
