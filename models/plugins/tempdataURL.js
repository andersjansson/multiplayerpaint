module.exports = exports = function tempdataURLPlugin (schema, options) {
  schema.add({ tempdataURL: String })
  
  schema.pre('save', function (next) {
    this.dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAK8CAYAAABxxc23AAAgAElEQVR4Xu3dC6x0V3UYYAcImLbCmEh5QDDX2DgQYRuaAlVswzVGMQRbhqhJlUDgBxM1UlDBKsEkRPKPlBAICZgWpLSJlR8aElWpYiwbMBTsa2wrqZMKPyhPGy7mlUgVr6gx4dm1YKYMx3PvzJ45M3P27O9IS/efe89j729tX9+zzjn7/MBxFgIECBAgQIAAAQIECBAgQGDrBX5g63uogwQIECBAgAABAgQIECBAgMBxCgAGAQECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsigQYFHhF9flPEaRH3GfX/W/H10xFviLg54ksNuugyAQIECBAgQIBAwwIKAA0nX9cJbKlAnvx/NOIBM/p3d/z8yxGfHRUL/nd83d9SE90iQIAAAQIECBAgcJwCgEFAgMC2CVwTHXrmEp26Kba9f8QXIm6N+OrEvo6Pfz8u4p6IvJPgxiWOY1MCBAgQIECAAAECaxVQAFgrt4MRILAGgY/FMR61huPkIfIugusi3h5xQ4THCtYE7zAECBAgQIAAAQLlAgoA5Wa2IEBg2AJ5+38++7+J5c446B0RRyNu30QDHJMAAQIECBAgQIDAQQIKAMYGAQLbJrAXHXpKp1N5G39OAPgPEXl7/2PX0Ol3xDH+KOKqNRzLIQgQIECAAAECBAjM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/vz3osttsWHeyp99ythfdEe2I0CAAAECBAgQINCCgAJAC1nWRwLfE8hb4s89AOSb8f0LI961JNjkSf4DY1/3jfjxiJ0l9zt+Nd/4pN8t/UuC2pwAAQIECBAgQKAtAQWAtvKttwTyUYBPRHTvAhjLfDv+8WcRPxTxgxH5+RsRH4l49GilPAH/asTxEXmy3+dJ/mSGPhcfbom4IuIaqSNAgAABAgQIECBAYDkBBYDl/GxNoEaB90ajc/b/IS55W/+xiJytf3+IDdQmAgQIECBAgAABArUKKADUmjntJrC4wGETAi6+18W3/GBsmlf5nfQvbmhLAgQIECBAgAABAjMFFABmElmBwFYKZBHg8oiHRjwhYl2/C3KSwc9E5HwDX4i4LOL2rRTWKQIECBAgQIAAAQIDE1jXH/0D67bmECAwIfCM+PfVETlZXx/L5En+PbHDN41O+nPuAAsBAgQIECBAgAABAhsSUADYELzDEhiYwPiOgJzQ78MRj4m436iNOQng+Hv5re4kgPk9J/kDS6jmECBAgAABAgQIEOgKKAAYEwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgQIAAAQIECBAgoABgDBAgQIAAAQIECBAgQIAAgQYEFAAaSLIuEiBAgAABAgQIECBAgAABBQBjgAABAgQIECBAgAABAgQINCCgANBAknWRAAECBAgQIECAAAECBAgoABgDBAgQIECAAAECBAgQIECgAQEFgAaSrIsECBAgQIAAAQIECBAgQEABwBggQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAIGhCVw/tAZV0J5/Fm18SMQJET+45vaeuObjORwBAgQILCigALAgnM0IECBAgACBlQkoABxOmyf5p0TcN+IBEfcbrf6N+PpPEfcZfV1Zgjo7VgBYl7TjECBAYEkBBYAlAW1OgAABAgQIEFiDwEviGL8QcWZEXu2/O+IfI/444tqID62hDQ5BgAABApULKABUnkDNJ0CAAAECBLZOIK/gPyfi0oh/EXHS6GT/tvj63yL+49b1WIcIECBAYC0CCgBrYXYQAgQIECBAYEUCJ8d+fzPi1BXtf127/bE40LdHJ/t5hT+v7udV/i9FvDzixnU1xHEIECBAYHsFFAC2N7d6RoAAAQIEtkHgoPkAHj3q3I/G178b/fsjlXf4M9H+90S8LeJblfdF8wkQIEBggAIKAANMiiYRIECAAAEC3xHIk//HRdx6gMed8f1XR3ySFwECBAgQIDBbQAFgtpE1CBAgQIAAgc0IjK/+n7uZwzsqAQIECBDYLgEFgO3Kp94QIECAAIFtElAA2KZs6gsBAgQIbFxAAWDjKdAAAgQIECBA4AABBQBDgwABAgQI9CigANAjpl0RIECAAAECvQooAHyP87fjn7/Vq66dESBAgEBzAgoAzaVchwkQIECAQDUCCgDfTVWe/L8y4ncUAaoZuxpKgACBQQooAAwyLRpFgAABAgQIhEAWAE6JOKlhjTz5/7WIL0fsNOyg6wQIECDQg4ACQA+IdkGAAAECBAisROD1sdcXRTxoJXsf/k7HV/7vjqY+YvjN1UICBAgQGLqAAsDQM6R9BAgQIECgbYGvRPc/FPGvG2DIk/x8zv/UiJNHJ/1u+28g8bpIgACBdQkoAKxL2nEIECBAgACBRQT+OjZ6UsT/3NIiQD7i8JsRz4j4sYi/GyF9JL7ePCoILOJmGwIECBAgcC8BBQCDggABAgQIEBi6QBYBfjJiWx4FyCv97xn150dHJ/3vjK+vjrhr6MnQPgIECBCoV0ABoN7caTkBAgQIEGhJIB8F+HjET1Xa6WlX+rNPPxPxqUr7pNkECBAgUJmAAkBlCdNcAgQIECDQqMD/in4/atT3oRcCTot2PjHijIh/G3H/CFf6Gx24uk2AAIEhCSgADCkb2kKAAAECBAjMEpgsBOSr8e6ctcGKf37iaP8/El9PiDh+9Pmr8TXb9/cRn4nIV/m50r/iZNg9AQIECBwuoABghBAgQIAAAQI1CuQrAh8/kIbnrfwfjbg94paIjw2kXZpBgAABAgS+T0ABwIAgQIAAAQIECBAgQIAAAQINCCgANJBkXSRAgAABAgQIECBAgAABAgoAxgABAgQIECBAgAABAgQIEGhAQAGggSTrIgECBAgQIECAAAECBAgQUAAwBggQIECAAAECBAgQIECAQAMCCgANJFkXCRAgQIAAAQIECBAgQICAAoAxQIAAAQIECBAgQIAAAQIEGhBQAGggybpIgAABAgQIECBAgAABAgQUAIwBAgQIECBAgAABAgQIECDQgIACQANJ1kUCBAgQIECAAAECBAgQIKAAYAwQIECAAAECBAgQIECAAIEGBBQAGkiyLhIgQIAAAQIECBAgQIAAAQUAY4AAAQIECBAgQIAAAQIECDQgoADQQJJ1kQABAgQIECBAgAABAgQIKAAYAwQIECBAgAABAgQIECBAoAEBBYAGkqyLBAgQIECAAAECBAgQIEBAAcAYIECAAAECBAgQIECAAAECDQgoADSQZF0kQIAAAQIECBAgQIAAAQIKAMYAAQIECBAgQIAAAQIECBBoQEABoIEk6yIBAgQIECBAgAABAgQIEFAAMAYIECBAgAABAgQIECBAgEADAgoADSRZFwkQIECAAAECBAgQIECAgAKAMUCAAAECBAgQIECAAAECBBoQUABoIMm6SIAAAQIECBAgQIAAAQIEFACMAQIECBAgQIAAAQIECBAg0ICAAkADSdZFAgQIECBAgAABAgQIECCgAGAMECBAgAABAgQIECBAgACBBgQUABpIsi4SIECAAAECBAgQIECAAAEFAGOAAAECBAgQIECAAAECBAg0IKAA0ECSdZEAAQIECBAgQIAAAQIECCgAGAMECBAgQIAAAQIECBAgQKABAQWABpKsiwQIECBAgAABAgQIECBAQAHAGCBAgAABAgQIECBAgAABAg0IKAA0kGRdJECAAAECBAgQIECAAAECCgDGAAECBAgQIECAAAECBAgQaEBAAaCBJOsiAQIECBAgQIAAAQIECBBQADAGCBAgQIAAAQIECBAgQIBAAwIKAA0kWRcJECBAgAABAgQIECBAgIACgDFAgAABAgQIECBAgAABAgQaEFAAaCDJukiAAAECBAgQIECAAAECBBQAjAECBAgQIECAAAECBAgQINCAgAJAA0nWRQIECBAgMGCB66Nt5w64fZpGgAABAgS2RkABYGtSqSMECBAgQKBKAQWAKtOm0QQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGbDmdZBAAAA+UlEQVR1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo4ACQI1Z02YCBAgQIECAAAECBAgQIFAooABQCGZ1AgQIECBAgAABAgQIECBQo8D/AybaKyaxDQXgAAAAAElFTkSuQmCC"
    next()
  })
}
