import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { db } from "../../services/firebaseConnection";
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
  item: {
    id: string;
    tarefa: string;
    public: boolean;
    user: string;
    created: string;
  };
  comments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  userEmail: string;
}

export default function Task({ item, comments }: TaskProps) {
  const { data: session } = useSession();

  const [input, setInput] = useState("");
  const [commentList, setCommentList] = useState<CommentProps[]>(comments || []);

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
      const dataComment: CommentProps = {
        id: docRef.id,
        comment: input,
        taskId: item?.id,
        user: session?.user?.name,
        userEmail: session?.user?.email,
      };
      setCommentList((oldComments) => [...oldComments, dataComment]);
      setInput("");
    }catch(err){
        console.log(err);
    }
  }

  async function handleDeleteComment(id: string) {
    try{
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);
      const updatedComments = commentList.filter((comment) => comment.id !== id);
      setCommentList(updatedComments);
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
      <section className={styles.commentContainer}>
            <h2>Todos os Comentários</h2>
            {commentList.length === 0 && (<span>Não há comentários para essa tarefa</span>)}
            {commentList.map((item) => (
              <article key={item.id} className={styles.comment}>
                <div className={styles.headComment}>
                  <label className={styles.commentsLabel}>{item.user}</label>
                  {item.userEmail === session?.user?.email && (
                    <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                    <FaTrash size={18} color="#EA3140"/>
                  </button>
                  )}
                </div>
                <p>{item.comment}</p>
              </article>
            ))}

      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const docRef = doc(db, "tasks", id);

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);
  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      taskId: doc.data().taskId,
      user: doc.data().user,
      userEmail: doc.data().userEmail,
    });
  });

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
      comments: allComments,
    },
  };
};
