export default function ({ $auth, redirect }) {
  if (!$auth.hasScope('army-books')) {
    return redirect('/');
  }
}
