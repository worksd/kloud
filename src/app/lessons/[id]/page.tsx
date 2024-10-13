export default function LessonDetail(props: any) {

  console.log(props);

  return (
    <>
      <div>Hello Lesson Detail {props.params.id}</div>
    </>
  );
}