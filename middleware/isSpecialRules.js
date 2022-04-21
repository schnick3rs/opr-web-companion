export default function ({ $auth, redirect }) {
  if (!$auth.hasScope('special-rules')) {
    return redirect('/');
  }
}
