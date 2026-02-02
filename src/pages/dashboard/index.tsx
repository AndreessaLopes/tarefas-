import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";
import { getSession } from "next-auth/react";
import { Textarea } from "../../components/textarea";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { db } from "../../services/firebaseConnection";
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";

interface NomeProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  tarefa: string;
  public: boolean;
  user: string;
  created: Date;
}

export default function Dashboard({ user }: NomeProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(true);
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function loadTasks() {
      const tasksRef = collection(db, "tasks");
      const q = query(
        tasksRef,
        where("user", "==", user?.email),
        orderBy("created", "desc"),
      );
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            public: doc.data().public,
            user: doc.data().user,
            created: doc.data().created,
          });
        });
        setTasks(lista);
      });
    }
    loadTasks();
  }, [user?.email]);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.checked);
    setPublicTask(event.target.checked);
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`,
    );
    alert("Link copiado com sucesso!");
  }

  async function handleDeleteTask(id: string) {
    const taskDocRef = doc(db, "tasks", id);
    await deleteDoc(taskDocRef);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();
    if (input === "") return;
    if (!user?.email) return;

    try {
      await addDoc(collection(db, "tasks"), {
        tarefa: input,
        public: publicTask,
        user: user?.email,
        created: new Date(),
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
              <Textarea
                placeholder="Digite sua tarefa aqui..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública?</label>
              </div>
              <button type="submit" className={styles.button}>
                Criar tarefa
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas Tarefas</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PÚBLICO</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(item.id)}
                  >
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div>
              )}

              <div className={styles.taskContent}>
                {item.public ? (
                  <Link
                    href={`/task/${item.id}`}
                    target="_blank"
                    className={styles.taskText}
                  >
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p className={styles.taskText}>{item.tarefa}</p>
                )}

                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
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
