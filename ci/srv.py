"""srv.py DIR PORT — threaded static server on 127.0.0.1 with HTTP Range (206) support, no dependencies."""
import functools, http.server, os, re, sys


class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

    def send_head(self):
        rg = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not rg or os.path.isdir(path) or not os.path.exists(path): return super().send_head()
        size = os.path.getsize(path); m = re.match(r'bytes=(\d*)-(\d*)', rg)
        if not m: return super().send_head()
        a = int(m.group(1)) if m.group(1) else None; b = int(m.group(2)) if m.group(2) else None
        if a is None: a, b = max(0, size - (b or 0)), size - 1
        else: b = min(b if b is not None else size - 1, size - 1)
        if a >= size: self.send_response(416); self.send_header('Content-Range', f'bytes */{size}'); self.end_headers(); return None
        f = open(path, 'rb'); f.seek(a); data = f.read(b - a + 1); f.close()
        self.send_response(206); self.send_header('Content-Type', self.guess_type(path)); self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {a}-{b}/{size}'); self.send_header('Content-Length', str(len(data))); self.end_headers()
        import io; return io.BytesIO(data)


http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[2])), functools.partial(H, directory=sys.argv[1])).serve_forever()
